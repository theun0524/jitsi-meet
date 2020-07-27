package org.jitsi.meet.sdk;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.ubintis.android.sso.LoginHandler;
import com.ubintis.android.sso.LoginManager;
import com.ubintis.android.sso.data.FieldDefine;

public class SSOModule extends ReactContextBaseJavaModule {
  private Context mContext = getReactApplicationContext();
  private LoginManager mLoginManager = new LoginManager();


  private String SERVER_BASIC_URL = "https://devsso.postech.ac.kr/sso";
  private String CLIENT_ID = "postech-vmeeting-app";
  private String CLIENT_SECRET = "04DE137C0C5688E1C9E269E91C8E0C8B";
  private boolean SSO_APP_LOGIN_FLAG = true;

  SSOModule(ReactApplicationContext context) {
    super(context);
    mLoginManager.init(mContext, SERVER_BASIC_URL, CLIENT_ID, CLIENT_SECRET, SSO_APP_LOGIN_FLAG);
  }

  @NonNull
  @Override
  public String getName() {
    return "SSOModule";
  }

  @ReactMethod
  public void getIsAuthenticated(Callback successCallback, Callback errorCallback) {
    try {
      String state = mLoginManager.getState(mContext);
      if(FieldDefine.STATE_LOGIN.equals(state)) {
        String userInfo = mLoginManager.requestUserInfo(mContext);
        successCallback.invoke("success", userInfo);
      } else if (FieldDefine.STATE_NO_INSTALL.equals(state)) {
        successCallback.invoke("no_install", "");
      }
    } catch (Exception e) {
      String errorCode = mLoginManager.getErrorCode(mContext);
      errorCallback.invoke(errorCode);
    }
  }

  @ReactMethod
  public void login(final Callback successCallback, final Callback errorCallback) {
    LoginHandler mLoginHandler = new LoginHandler() {
      @Override
      public void run(boolean success) {
        if (success) {
          String userInfo = mLoginManager.requestUserInfo(mContext);
          successCallback.invoke("success", userInfo);
        } else {
          String errorCode = mLoginManager.getErrorCode(mContext);
          errorCallback.invoke(errorCode);
        }
      }
    };

    mLoginManager.startLoginActivity(getCurrentActivity(), mLoginHandler);
  }

  @ReactMethod
  public void logout() {
    mLoginManager.logout(mContext);
  }
}

