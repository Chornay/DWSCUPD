#import "AppDelegate.h"
#import <GoogleMaps/GoogleMaps.h>
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
// #import <GoogleMaps/GoogleMaps.h>
#import <Firebase.h>
#import "RNSplashScreen.h"  // here




@implementation AppDelegate
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{ 
  // [GMSServices provideAPIKey:@"AIzaSyBR12ziAnQxqnJJgdTcT5MaEbGVd0OP4SQ"]; //DEBUG google maps doesn't work using this key
  // [GMSServices provideAPIKey:@"AIzaSyD3 u5_JTMAOfMtlN0LlhDYImucaW5O-iUM"]; //DEBUG current api... used to work
  [GMSServices provideAPIKey:@"AIzaSyBS954hwjt-SaJCOfc1xJwWL71_wgqi1Eo"]; //newest created API
  // [GMSServices provideAPIKey:@"AIzaSyD3u5_JTMAOfMtlN0LlhDYImucaW5O-iUM"]; //API created from firebase
  
  [FIRApp configure];


  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"DOBBY_WALLA"
                                            initialProperties:nil];

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  [RNSplashScreen show];  // here

  return YES;
  
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
