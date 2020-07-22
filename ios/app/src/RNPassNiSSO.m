//
//  RNPassNiSSO.m
//  vmeeting
//
//  Created by 오수경 on 2020/07/21.
//  Copyright © 2020 Facebook. All rights reserved.
//

// RNPassNiSSO.m
#import "RNPassNiSSO.h"
#import "PassNiOAuthService.h"
#import <React/RCTLog.h>


@implementation RNPassNiSSO

// To export a module named CalendarManager
RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(isAuthorized: (RCTResponseSenderBlock)callback)
{
  PassNiOAuthService *passniOAuth = [PassNiOAuthService sharedInstance];
  callback(@[NSNumber numberWithBool:[passniOAuth isAuthorized]]);
}

RCT_EXPORT_METHOD(findEvents:(RCTResponseSenderBlock)callback)
{
  callback(@[@"Hello form iOS"]);
}
// This would name the module AwesomeCalendarManager instead
// RCT_EXPORT_MODULE(AwesomeCalendarManager);

@end
