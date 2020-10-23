/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
// Required by @react-native-community/google-signin
#import <RNGoogleSignin/RNGoogleSignin.h>
// Required by react-native-fbsdk
#import <FBSDKCoreKit/FBSDKCoreKit.h>
// Required by https://facebook.github.io/react-native/docs/linking
#import <React/RCTLinkingManager.h>
// Required by @react-native-firebase/dynamic-links
#import <RNFBDynamicLinks/RNFBDynamicLinksAppDelegateInterceptor.h>
// Required by react-native-orientation-locker https://github.com/wonday/react-native-orientation-locker
#import "Orientation.h"
// Required by react-native-code-push
#import <CodePush/CodePush.h>
// Required by @react-native-community/push-notification-ios
#import <RNCPushNotificationIOS.h>
#import <UserNotifications/UserNotifications.h>

// Required by react-native-firebase
@import Firebase;

@implementation AppDelegate

// Required by react-native-orientation-locker https://github.com/wonday/react-native-orientation-locker
- (UIInterfaceOrientationMask)application:(UIApplication *)application supportedInterfaceOrientationsForWindow:(UIWindow *)window {
  return [Orientation getOrientation];
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Require by react-native-firebase
  if ([FIRApp defaultApp] == nil) {
    [FIRApp configure];
  }

  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"Nuli"
                                            initialProperties:nil];

  rootView.backgroundColor = [UIColor blackColor];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];

  // https://facebook.github.io/react-native/docs/running-on-device.html#pro-tips
  // Adapted for the new storyboard requirement: https://stackoverflow.com/a/61213687/8412141 + https://stackoverflow.com/a/38610128/8412141
  UIStoryboard *storyboard = [UIStoryboard storyboardWithName:@"LaunchScreen" bundle:[NSBundle mainBundle]];
  UIViewController *launchScrenViewController = [storyboard instantiateInitialViewController];
  launchScrenViewController.view.frame = self.window.bounds;
  rootView.loadingView = launchScrenViewController.view;

  // Required by @react-native-community/push-notification-ios
  // https://github.com/react-native-community/react-native-push-notification-ios/issues/63#issuecomment-583618575
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;

  return YES;
}

// Required by @react-native-community/google-signin, react-native-fbsdk, @react-native-firebase/dynamic-links and RCTLinking
// https://blog.usejournal.com/firebase-dynamic-links-for-your-react-native-app-ios-setup-only-c6e1f5a7944e
- (BOOL)application:(UIApplication *)application
            openURL:(nonnull NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  NSString *formattedUrl = [url absoluteString];
  NSLog(@"LOG: openURL: %@", formattedUrl);

  // Get dynamic link from custom url scheme
  FIRDynamicLink *dynamicLink = [[FIRDynamicLinks dynamicLinks] dynamicLinkFromCustomSchemeURL:url];

  if (!dynamicLink) {
    // Get dynamic link from universal link
    dynamicLink = [[FIRDynamicLinks dynamicLinks] dynamicLinkFromUniversalLinkURL:url];
  }

  if (dynamicLink && dynamicLink.url) {
    NSString *formattedUrl = [dynamicLink.url absoluteString];
    NSLog(@"LOG: dynamicLink: %@", formattedUrl);

    BOOL handledByFirebase = [[RNFBDynamicLinksAppDelegateInterceptor sharedInstance] application:application openURL:dynamicLink.url options:options];
    BOOL handledByReactNative = [RCTLinkingManager application:application openURL:dynamicLink.url options:options];

    return handledByFirebase || handledByReactNative;
  }

  BOOL handledByFacebook = [[FBSDKApplicationDelegate sharedInstance] application:application openURL:url options:options];
  BOOL handledByGoogle = [RNGoogleSignin application:application openURL:url options:options];
  BOOL handledByReactNative = [RCTLinkingManager application:application openURL:url options:options];

  return handledByFacebook || handledByGoogle || handledByReactNative;
}

// Required by @react-native-firebase/dynamic-links
- (BOOL)application:(UIApplication *)application
continueUserActivity:(nonnull NSUserActivity *)userActivity
 restorationHandler: (nonnull void (^)(NSArray<id<UIUserActivityRestoring>> *_Nullable))restorationHandler {
  NSLog(@"LOG: restorationHandler");

  return [[RNFBDynamicLinksAppDelegateInterceptor sharedInstance] application:application continueUserActivity:userActivity restorationHandler:restorationHandler];
}

// Required by @react-native-community/push-notification-ios
- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification
{
  [RNCPushNotificationIOS didReceiveLocalNotification:notification];
}
// https://github.com/react-native-community/react-native-push-notification-ios/issues/63#issuecomment-583618575
- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
  completionHandler(UNAuthorizationOptionSound | UNAuthorizationOptionAlert | UNAuthorizationOptionBadge);
}

// CodePush takes care of returning the jsBundle for the Staging and Release env
// https://docs.microsoft.com/en-us/appcenter/distribution/codepush/react-native#plugin-installation-and-configuration-for-react-native-060-version-and-above-ios
- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  #if DEBUG
    return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
  #else
    return [CodePush bundleURL];
  #endif
}

@end
