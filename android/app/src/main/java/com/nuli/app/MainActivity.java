package com.nuli.app;

import com.facebook.react.ReactActivity;

import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;

// Configuration for https://github.com/wonday/react-native-orientation-locker
import android.content.Intent;
import android.content.res.Configuration;

// react-native-splash-screen
import android.os.Build;
import com.facebook.soloader.SoLoader;
import org.devio.rn.splashscreen.SplashScreen;

// Status bar handling (not working ATM)
import android.annotation.TargetApi;
import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "Nuli";
  }

  // Splash screen: https://github.com/crazycodeboy/react-native-splash-screen#third-stepplugin-configuration
  // https://github.com/crazycodeboy/react-native-splash-screen/issues/418
  @Override
  protected void onCreate(Bundle savedInstanceState) {
//     if (Build.VERSION.SDK_INT >= 20) {
//       setTranslucent();
//     }
    SoLoader.init(this, false);
    SplashScreen.show(this, R.style.SplashTheme);
    super.onCreate(savedInstanceState);
  }

  // Set bar translucent at startup to prevent the view from moving around
  // https://github.com/facebook/react-native/blob/master/ReactAndroid/src/main/java/com/facebook/react/modules/statusbar/StatusBarModule.java#L118-L158
  // https://callstack.com/blog/android-drawer-and-statusbar-done-right-for-react-native/
//   @TargetApi(20)
//   private void setTranslucent() {
//     final Activity activity = this;
//     View decorView = activity.getWindow().getDecorView();
//     decorView.setOnApplyWindowInsetsListener(
//       new View.OnApplyWindowInsetsListener() {
//         @Override
//         public WindowInsets onApplyWindowInsets(View v, WindowInsets insets) {
//           WindowInsets defaultInsets = v.onApplyWindowInsets(insets);
//           return defaultInsets.replaceSystemWindowInsets(
//               defaultInsets.getSystemWindowInsetLeft(),
//               0,
//               defaultInsets.getSystemWindowInsetRight(),
//               defaultInsets.getSystemWindowInsetBottom());
//         }
//       });
//   }

  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new ReactActivityDelegate(this, getMainComponentName()) {
      @Override
      protected ReactRootView createRootView() {
        return new RNGestureHandlerEnabledRootView(MainActivity.this);
      }
    };
  }

  // Configuration for https://github.com/wonday/react-native-orientation-locker
  @Override
  public void onConfigurationChanged(Configuration newConfig) {
    super.onConfigurationChanged(newConfig);
    Intent intent = new Intent("onConfigurationChanged");
    intent.putExtra("newConfig", newConfig);
    this.sendBroadcast(intent);
  }
}
