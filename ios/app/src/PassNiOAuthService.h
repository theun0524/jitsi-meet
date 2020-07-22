//
//  PassNiOAuthLogin.h
//  PassNiOAuth
//
//  Created by macmini on 23/05/2019.
//  Copyright © 2019 macmini. All rights reserved.
//
#import <UIKit/UIKit.h>
#import <Foundation/Foundation.h>

@protocol OIDExternalUserAgentSession;
@class OIDAuthState;
@class OIDTokenResponse;
@class OIDServiceConfiguration;

// callback function define (내부용)
typedef void(^authorizeComplete)(NSString * _Nullable code,
                                 NSString * _Nullable state,
                                 NSError * _Nullable error);
typedef void(^authorizeRPComplete)(NSString * _Nullable code,
                                   NSString * _Nullable rpCode,
                                   NSString * _Nullable state,
                                   NSError * _Nullable error);
typedef void(^codeExchangeComplete)(OIDTokenResponse *_Nullable tokenResponse,
                                    NSError * _Nullable error);
typedef void(^refreshTokenComplete)(NSString * _Nullable accessToken,
                                    NSError * _Nullable error);


// callback function define
typedef void(^pniTokenExchangeComplete)(NSString * _Nullable pniToken,
                                        NSError * _Nullable error);
typedef void(^userInfoComplete)(NSDictionary * _Nullable userInfo,
                                NSError * _Nullable error);
typedef void(^appListComplete)(NSArray * _Nullable appInfoArray,
                               NSError * _Nullable error);
typedef void(^logoutComplete)(NSError * _Nullable error);

NS_ASSUME_NONNULL_BEGIN

/*!
 @protocol PassNiOAuthServiceLoginDelegate
 @brief PassNiOAuthService 로그인 서비스의 대리자
 */
@protocol PassNiOAuthServiceLoginDelegate <NSObject>

/*!
 @brief 'doLogin' 로그인 요청시 결과를 대리자에게 알린다
 @param isSuccess   로그인 성공여부(YES/NO)
 @param error       로그인 error
 */
- (void)didFinishLoginRequest:(BOOL)isSuccess error:(NSError * _Nullable)error;
@end

@interface PassNiOAuthService : NSObject
{
}

/*!
 @brief The @c PassNiOAuthServiceLoginDelegate delegate.
 */
@property(nonatomic, weak) id<PassNiOAuthServiceLoginDelegate> oAuthLoginDelegate;


/*!
 @internal
 @brief Unavailable. This class should not be initialized.
 */
- (instancetype)init NS_UNAVAILABLE;

/*!
 @brief PassNiOAuthServie 싱글톤 객체를 획득
 @return A @c PassNiOAuthService instance
 */
+ (instancetype)sharedInstance;

/*!
 @brief PassNiOAuthServie 인스턴스 초기화(환경설정)
 @param clientId        클라이언트 ID
 @param clientSecret    클라이언트 비밀값
 @param oAuthBaseUrl    클라이언트인증서버 기본 URL
 @param redirectURI     callback url (custom url scheme)
 @param rpRedirectURI   대표앱 callback url  (custom url scheme)
 @param isRpClient      대표앱 여부(YES/NO)
 */
- (void)setConfiguration:(NSString *)clientId
            clientSecret:(NSString *)clientSecret
            oAuthBaseUrl:(NSString *)oAuthBaseUrl
             redirectURI:(NSString *)redirectURI
           rpRedirectURI:(NSString *)rpRedirectURI
              isRpClient:(BOOL)isRpClient;

/*!
 @brief 인증상태
 @return 로그인상태(YES) or 로그아웃상태(NO)
 */
- (BOOL)isAuthorized;

/*!
 @brief 로그인요청
 @param         presentViewController        현재 활성화된 뷰콘트롤러
 @discussion    @c PassNiOAuthServiceLoginDelegate.didFinishLoginRequest:error: 이벤트를 사용하여 로그인 요청의 결과를 확인한다.
 @remarks       대표앱이 설치되어있으면 대표앱으로부터 로그인을 수행하고, 설치되어 있지 않으면 인증서버로부터 로그인을 수행한다.
                앱의 인증상태가 로그인상태인경우에는 기존 인증정보로 자동로그인되므로, 다시 로그인이 필요한 경우에는 반드시 로그아웃요청후 로그인을 수행해야 한다.
 */
- (void)doLogin:(UIViewController *)presentViewController;

/*!
 @brief 로그인요청(인증서버)
 @param         presentViewController        현재 활성화된 뷰콘트롤러
 @discussion    @c PassNiOAuthServiceLoginDelegate.didFinishLoginRequest:error: 이벤트를 사용하여 로그인 요청의 결과를 확인한다.
 @remarks       대표앱이 설치되어 있더라도, 인증서버로 로그인을 요청한다. 대표앱과 다른아이디로 로그인하고자 할때 사용한다.
 */
- (void)doLoginSelf:(UIViewController *)presentViewController;

/*!
 @brief 사용자정보 요청
 @param         userInfoCallback        사용자정보 결과를 받을 콜백함수
 @discussion    사용자정보 요청이 성공하면 NSDictionary 형태의 사용자정보가 반환된다.
 */
- (void)getUserInfo:(userInfoComplete)userInfoCallback;

/*!
@brief iOS 연동앱목록 요청
@param         appListCallback        연동앱목록 결과를 받을 콜백함수
@discussion    연동앱목록 요청이 성공하면 NSDictionary 형태의 앱목록 반환된다.
*/
- (void)getIosAppList:(appListComplete)appListCallback;

/*!
 @brief 웹용 토큰(pni_token)을 요청
 @param         pniTokenExchangeCallback    웹용 토큰(pni_token)를 받을 콜백함수
 @discussion    토큰 요청이 성공하면 NSString 형태의 토큰정보가가 반환된다.
 @remarks       네이티브앱에서 웹시스템으로 SSO 요청시 사용된다.
 */
- (void)getPniToken:(pniTokenExchangeComplete)pniTokenExchangeCallback;

/*!
 @brief 통합로그아웃요청
 @remarks       동일한 id_token 으로 로그인된 모든 앱이 로그아웃된다.
 */
- (void)doLogout:(logoutComplete)logoutCallback;

/*!
 @brief 인증상태 초기화
 @remarks      클라이언트의 인증상태를 초기화한다.
 */
- (void)doClearAuthState;

/*!
 @brief URL Scheme 으로 수신한 인증서비스 요청 처리
 @param         url    URL Scheme
 @discussion    대표앱/일반앱 간의 코드요청 및 응답처리와 웹시스템에서 네이티브앱으로 SSO 요청을 수행한다.
 */
- (BOOL)resumeRequestFlowWithURLScheme:(NSURL *)url;

@end

NS_ASSUME_NONNULL_END
