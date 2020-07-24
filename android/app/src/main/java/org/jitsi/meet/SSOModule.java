package org.jitsi.meet;

import android.content.Context;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.ubintis.android.sso.LoginHandler;
import com.ubintis.android.sso.LoginManager;
import com.ubintis.android.sso.data.FieldDefine;

import org.postech.vmeeting.MainActivity;

public class SSOModule extends ReactContextBaseJavaModule {
  private Context mContext;
  private LoginManager mLoginManager = new LoginManager();

  private LoginHandler mLoginHandler = new LoginHandler() {
    @Override
    public void run(boolean success) {
      if(success) {
        // 토큰 생성완료,
      } else {
        String errorCode = mLoginManager.getErrorCode(mContext);
      }
    }
  };

  private String SERVER_BASIC_URL = "https://devsso.postech.ac.kr/sso";
  private String CLIENT_ID = "postech-vmeeting-app";
  private String CLIENT_SECRET = "04DE137C0C5688E1C9E269E91C8E0C8B";
  private boolean SSO_APP_LOGIN_FLAG = false;

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
      successCallback.invoke(FieldDefine.STATE_LOGIN.equals(state));
    } catch (Exception e) {
      errorCallback.invoke(e.getMessage());
    }
  }

  @ReactMethod
  public void login() {
  }

  @ReactMethod
  public void logout() {
    mLoginManager.logout(mContext);
  }
}