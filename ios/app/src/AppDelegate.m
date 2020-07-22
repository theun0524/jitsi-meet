/*
 * Copyright @ 2018-present 8x8, Inc.
 * Copyright @ 2017-2018 Atlassian Pty Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#import "AppDelegate.h"
#import "FIRUtilities.h"
#import "Types.h"
#import "ViewController.h"
#import "PassNiOAuthService.h"

@import Crashlytics;
@import Fabric;
@import Firebase;
@import JitsiMeet;

@implementation AppDelegate

static NSString *const kRedirectURI = @"passni-sample-objc://oauth2redirect";
static NSString *const kRpRedirectURI = @"passni-rpclient-objc://oauth2redirect";
static NSString *const kURISchemeHost = @"oauth2redirect";
static NSString *const kClientID = @"postech-vmeeting-app";
static NSString *const kClientSecret = @"04DE137C0C5688E1C9E269E91C8E0C8B";
static NSString *const kOAuthBaseUrl = @"https://devsso.postech.ac.kr/sso";
static BOOL kIsRpClient = NO;

-             (BOOL)application:(UIApplication *)application
  didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    JitsiMeet *jitsiMeet = [JitsiMeet sharedInstance];

    jitsiMeet.conferenceActivityType = JitsiMeetConferenceActivityType;
    jitsiMeet.customUrlScheme = @"org.postech.vmeeting";
    jitsiMeet.universalLinkDomains = @[@"vmeeting.postech.ac.kr", @"devmeet.postech.ac.kr"];

    jitsiMeet.defaultConferenceOptions = [JitsiMeetConferenceOptions fromBuilder:^(JitsiMeetConferenceOptionsBuilder *builder) {
        [builder setFeatureFlag:@"resolution" withValue:@(360)];
        builder.serverURL = [NSURL URLWithString:@"https://devmeet.postech.ac.kr"];
        builder.welcomePageEnabled = YES;

    PassNiOAuthService *passniOAuth = [PassNiOAuthService sharedInstance]; [passniOAuth setConfiguration:kClientID
    clientSecret:kClientSecret oAuthBaseUrl:kOAuthBaseUrl redirectURI:kRedirectURI
    rpRedirectURI:kRpRedirectURI isRpClient:kIsRpClient];
        // Apple rejected our app because they claim requiring a
        // Dropbox account for recording is not acceptable.
#if DEBUG
        [builder setFeatureFlag:@"ios.recording.enabled" withBoolean:YES];
#endif
    }];

    // Initialize Crashlytics and Firebase if a valid GoogleService-Info.plist file was provided.
    if ([FIRUtilities appContainsRealServiceInfoPlist] && ![jitsiMeet isCrashReportingDisabled]) {
        NSLog(@"Enabling Crashlytics and Firebase");
        [FIRApp configure];
        [Fabric with:@[[Crashlytics class]]];
    }

    [jitsiMeet application:application didFinishLaunchingWithOptions:launchOptions];

    return YES;
}

- (void) applicationWillTerminate:(UIApplication *)application {
    NSLog(@"Application will terminate!");
    // Try to leave the current meeting graceefully.
    ViewController *rootController = (ViewController *)self.window.rootViewController;
    [rootController terminate];
}

#pragma mark Linking delegate methods

-    (BOOL)application:(UIApplication *)application
  continueUserActivity:(NSUserActivity *)userActivity
    restorationHandler:(void (^)(NSArray<id<UIUserActivityRestoring>> *restorableObjects))restorationHandler {

    if ([FIRUtilities appContainsRealServiceInfoPlist]) {
        // 1. Attempt to handle Universal Links through Firebase in order to support
        //    its Dynamic Links (which we utilize for the purposes of deferred deep
        //    linking).
        BOOL handled
          = [[FIRDynamicLinks dynamicLinks]
                handleUniversalLink:userActivity.webpageURL
                         completion:^(FIRDynamicLink * _Nullable dynamicLink, NSError * _Nullable error) {
           NSURL *firebaseUrl = [FIRUtilities extractURL:dynamicLink];
           if (firebaseUrl != nil) {
             userActivity.webpageURL = firebaseUrl;
             [[JitsiMeet sharedInstance] application:application
                                continueUserActivity:userActivity
                                  restorationHandler:restorationHandler];
           }
        }];

        if (handled) {
          return handled;
        }
    }

    // 2. Default to plain old, non-Firebase-assisted Universal Links.
    return [[JitsiMeet sharedInstance] application:application
                              continueUserActivity:userActivity
                                restorationHandler:restorationHandler];
}

- (BOOL)application:(UIApplication *)app
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {

    // This shows up during a reload in development, skip it.
    // https://github.com/firebase/firebase-ios-sdk/issues/233
    if ([[url absoluteString] containsString:@"google/link/?dismiss=1&is_weak_match=1"]) {
        return NO;
    }
  
    if ( [[url host] isEqualToString:kURISchemeHost] ) {
        if ([[PassNiOAuthService sharedInstance] resumeRequestFlowWithURLScheme:url]) {
          return YES; }
    }

    NSURL *openUrl = url;

    if ([FIRUtilities appContainsRealServiceInfoPlist]) {
        // Process Firebase Dynamic Links
        FIRDynamicLink *dynamicLink = [[FIRDynamicLinks dynamicLinks] dynamicLinkFromCustomSchemeURL:url];
        NSURL *firebaseUrl = [FIRUtilities extractURL:dynamicLink];
        if (firebaseUrl != nil) {
            openUrl = firebaseUrl;
        }
    }

    return [[JitsiMeet sharedInstance] application:app
                                           openURL:openUrl
                                           options:options];
}

- (void)scene:(UIScene *)scene willConnectToSession:(UISceneSession *)session options:(UISceneConnectionOptions *)connectionOptions {
    NSURL *url = connectionOptions.URLContexts.allObjects.firstObject.URL;
    if ( [[url host] isEqualToString:kURISchemeHost] ) {
        [[PassNiOAuthService sharedInstance] resumeRequestFlowWithURLScheme:url];
    }
  }

- (void)scene:(UIScene *)scene openURLContexts:(NSSet<UIOpenURLContext *> *)URLContexts API_AVAILABLE(ios(13.0)){
    NSURL *url = URLContexts.allObjects.firstObject.URL;
    if ( [[url host] isEqualToString:kURISchemeHost] ) {
        [[PassNiOAuthService sharedInstance] resumeRequestFlowWithURLScheme:url]; }
  }

@end
