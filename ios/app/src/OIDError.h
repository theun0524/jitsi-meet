/*! @file OIDError.h
    @brief AppAuth iOS SDK
    @copyright
        Copyright 2015 Google Inc. All Rights Reserved.
    @copydetails
        Licensed under the Apache License, Version 2.0 (the "License");
        you may not use this file except in compliance with the License.
        You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

        Unless required by applicable law or agreed to in writing, software
        distributed under the License is distributed on an "AS IS" BASIS,
        WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
        See the License for the specific language governing permissions and
        limitations under the License.
 */

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/*! @brief The error domain for all NSErrors returned from the AppAuth library.
 */
extern NSString *const OIDGeneralErrorDomain;

/*! @brief The error domain for OAuth specific errors on the authorization endpoint.
    @discussion This error domain is used when the server responds to an authorization request
        with an explicit OAuth error, as defined by RFC6749 Section 4.1.2.1. If the authorization
        response is invalid and not explicitly an error response, another error domain will be used.
        The error response parameter dictionary is available in the
        \NSError_userInfo dictionary using the @c ::OIDOAuthErrorResponseErrorKey key.
        The \NSError_code will be one of the @c ::OIDErrorCodeOAuthAuthorization enum values.
    @see https://tools.ietf.org/html/rfc6749#section-4.1.2.1
 */
extern NSString *const OIDOAuthAuthorizationErrorDomain;

/*! @brief The error domain for OAuth specific errors on the token endpoint.
    @discussion This error domain is used when the server responds with HTTP 400 and an OAuth error,
        as defined RFC6749 Section 5.2. If an HTTP 400 response does not parse as an OAuth error
        (i.e. no 'error' field is present or the JSON is invalid), another error domain will be
        used. The entire OAuth error response dictionary is available in the \NSError_userInfo
        dictionary using the @c ::OIDOAuthErrorResponseErrorKey key. Unlike transient network
        errors, errors in this domain invalidate the authentication state, and either indicate a
        client error or require user interaction (i.e. reauthentication) to resolve.
        The \NSError_code will be one of the @c ::OIDErrorCodeOAuthToken enum values.
    @see https://tools.ietf.org/html/rfc6749#section-5.2
 */
extern NSString *const OIDOAuthTokenErrorDomain;

/*! @brief An error domain representing received HTTP errors.
 */
extern NSString *const OIDHTTPErrorDomain;

/*! @brief An error key for the original OAuth error response (if any).
 */
extern NSString *const OIDOAuthErrorResponseErrorKey;

/*! @brief The key of the 'error' response field in a RFC6749 Section 5.2 response.
    @remark error
    @see https://tools.ietf.org/html/rfc6749#section-5.2
 */
extern NSString *const OIDOAuthErrorFieldError;

/*! @brief The key of the 'error_description' response field in a RFC6749 Section 5.2 response.
    @remark error_description
    @see https://tools.ietf.org/html/rfc6749#section-5.2
 */
extern NSString *const OIDOAuthErrorFieldErrorDescription;

/*! @brief The key of the 'error_uri' response field in a RFC6749 Section 5.2 response.
    @remark error_uri
    @see https://tools.ietf.org/html/rfc6749#section-5.2
 */
extern NSString *const OIDOAuthErrorFieldErrorURI;

/*! @brief The various error codes returned from the AppAuth library.
 */
typedef NS_ENUM(NSInteger, OIDErrorCode) {

  /*! @brief Indicates the user manually canceled the OAuth authorization code flow.
   */
  OIDErrorCodeUserCanceledAuthorizationFlow = -3,

  /*! @brief Indicates an OAuth authorization flow was programmatically cancelled.
   */
  OIDErrorCodeProgramCanceledAuthorizationFlow = -4,

  /*! @brief Indicates a network error or server error occurred.
   */
  OIDErrorCodeNetworkError = -5,

  /*! @brief Indicates a server error occurred.
   */
  OIDErrorCodeServerError = -6,

  /*! @brief Indicates a problem occurred deserializing the response/JSON.
   */
  OIDErrorCodeJSONDeserializationError = -7,

  /*! @brief Indicates a problem occurred constructing the token response from the JSON.
   */
  OIDErrorCodeTokenResponseConstructionError = -8,

  /*! @brief @c UIApplication.openURL: returned NO when attempting to open the authorization
          request in mobile Safari.
   */
  OIDErrorCodeSafariOpenError = -9,

  /*! @brief Indicates a problem when trying to refresh the tokens.
   */
  OIDErrorCodeTokenRefreshError = -11,

    /*! @brief 앱간의 uri_scheme 호출 오류
     */
    OIDErrorCodeURISchemeOpenURLError = -16,
    
    /*! @brief 요청한 state 값과 일치하지 않음
     */
    OIDErrorCodeStateMismatchError = -17,
    
    /*! @brief 미인증상태에서 사용자정보 API 호출
     */
    OIDErrorCodeNotAuthorizedStatusError = -18,
};

/*! @brief Enum of all possible OAuth error codes as defined by RFC6749
    @discussion Used by @c ::OIDErrorCodeOAuthAuthorization and @c ::OIDErrorCodeOAuthToken
        which define endpoint-specific subsets of OAuth codes. Those enum types are down-castable
        to this one.
    @see https://tools.ietf.org/html/rfc6749#section-11.4
    @see https://tools.ietf.org/html/rfc6749#section-4.1.2.1
    @see https://tools.ietf.org/html/rfc6749#section-5.2
 */
typedef NS_ENUM(NSInteger, OIDErrorCodeOAuth) {

  /*! @remarks invalid_request
      @see https://tools.ietf.org/html/rfc6749#section-4.1.2.1
      @see https://tools.ietf.org/html/rfc6749#section-5.2
   */
  OIDErrorCodeOAuthInvalidRequest = 2,

  /*! @remarks unauthorized_client
      @see https://tools.ietf.org/html/rfc6749#section-4.1.2.1
      @see https://tools.ietf.org/html/rfc6749#section-5.2
   */
  OIDErrorCodeOAuthUnauthorizedClient = 3,

  /*! @remarks access_denied
      @see https://tools.ietf.org/html/rfc6749#section-4.1.2.1
   */
  OIDErrorCodeOAuthAccessDenied = 4,

  /*! @remarks unsupported_response_type
      @see https://tools.ietf.org/html/rfc6749#section-4.1.2.1
   */
  OIDErrorCodeOAuthUnsupportedResponseType = 5,

  /*! @remarks invalid_scope
      @see https://tools.ietf.org/html/rfc6749#section-4.1.2.1
      @see https://tools.ietf.org/html/rfc6749#section-5.2
   */
  OIDErrorCodeOAuthInvalidScope = 6,

  /*! @remarks server_error
      @see https://tools.ietf.org/html/rfc6749#section-4.1.2.1
   */
  OIDErrorCodeOAuthServerError = 7,

  /*! @remarks temporarily_unavailable
      @see https://tools.ietf.org/html/rfc6749#section-4.1.2.1
   */
  OIDErrorCodeOAuthTemporarilyUnavailable = 8,

  /*! @remarks invalid_client
      @see https://tools.ietf.org/html/rfc6749#section-5.2
   */
  OIDErrorCodeOAuthInvalidClient = 9,

  /*! @remarks invalid_grant
      @see https://tools.ietf.org/html/rfc6749#section-5.2
   */
  OIDErrorCodeOAuthInvalidGrant = 10,

  /*! @remarks unsupported_grant_type
      @see https://tools.ietf.org/html/rfc6749#section-5.2
   */
  OIDErrorCodeOAuthUnsupportedGrantType = 11,

    
    /*! @remarks invalid_code
        @brief 조회된 코드가 없는경우.
     */
    OIDErrorCodeOAuthInvalidCode = 14,
    
    /*! @remarks expired_code
        @brief 조회된 코드가 유효시간이 만료되었을 경우.
     */
    OIDErrorCodeOAuthExpiredCode = 15,
    
    /*! @remarks invalid_access_token
        @brief 조회된 access_token이 없는경우.
     */
    OIDErrorCodeOAuthInvalidAccessToken = 16,
    
    /*! @remarks expired_access_token
        @brief 조회된 access_token의 유효기간이 만료된 경우.
     */
    OIDErrorCodeOAuthExpiredAccessToken = 17,
    
    /*! @remarks invalid_refresh_token
        @brief 조회된 refresh_token이 없는경우.
     */
    OIDErrorCodeOAuthInvalidRefreshToken = 18,
    
    /*! @remarks expired_refresh_token
        @brief 조회된 refresh_token이 유효시간이 만료되었을 경우.
     */
    OIDErrorCodeOAuthExpiredRefreshToken = 19,
    
    /*! @remarks invalid_id_token
        @brief 조회된 id_token이 없는경우
     */
    OIDErrorCodeOAuthInvalidIdToken = 20,
    
    /*! @remarks expired_id_token
        @brief 조회된 id_token의 유효기간이 만료된 경우.
     */
    OIDErrorCodeOAuthExpiredIdToken = 21,
    
    /*! @remarks user_cancel
        @brief 정보제공동의 화면에서 사용자가 취소를 하였을 경우.
     */
    OIDErrorCodeOAuthUserCancel = 22,
    
    /*! @remarks invalid_request_uri
        @brief redirect_uri 정보가 올바르지 않은 경우
     */
    OIDErrorCodeOAuthInvalidRequestURI = 23,
    
    /*! @remarks invalid_rp_client
        @brief 요청을 보낸 클라이언트가 대표앱으로 설정되어 있지 않은 경우.
     */
    OIDErrorCodeOAuthInvalidRpClient = 24,
    
    /*! @remarks invalid_rp_request_uri
        @brief 대표앱의 redirect_uri 정보가 올바르지 않은 겨우
     */
    OIDErrorCodeOAuthInvalidRpClientRequestURI = 25,
    
    /*! @remarks err_user_data
        @brief 사용자 정보 요청시 토큰은 유효하지만, DB에서 사용자 정보 조회가 정상적으로 되지 않는경우.
     */
    OIDErrorCodeOAuthInvalidUserData = 26,

  /*! @brief An OAuth error not known to this library
      @discussion Indicates an OAuth error as per RFC6749, but the error code was not in our
          list. It could be a custom error code, or one from an OAuth extension. See the "error" key
          of the \NSError_userInfo property. Such errors are assumed to invalidate the
          authentication state
   */
  OIDErrorCodeOAuthOther = 0xF000,  // 61,440
};



/*! @brief The exception text for the exception which occurs when a
        @c OIDExternalUserAgentSession receives a message after it has already completed.
 */
extern NSString *const OIDOAuthExceptionInvalidAuthorizationFlow;

/*! @brief The text for the exception which occurs when a Token Request is constructed
        with a null redirectURL for a grant_type that requires a nonnull Redirect
 */
extern NSString *const OIDOAuthExceptionInvalidTokenRequestNullRedirectURL;

NS_ASSUME_NONNULL_END
