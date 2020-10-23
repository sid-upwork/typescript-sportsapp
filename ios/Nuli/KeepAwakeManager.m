//
//  KeepAwake.m
//  Nuli
//
//  Created by Thomas Henrissat on 13/02/2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "UIKit/UIKit.h"
#import <React/RCTLog.h>
#import "KeepAwakeManager.h"

@implementation KeepAwakeManager

// To export a module named KeepAwake
RCT_EXPORT_MODULE(KeepAwake);

RCT_EXPORT_METHOD(activate)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    [[UIApplication sharedApplication] setIdleTimerDisabled:YES];
    RCTLogInfo(@"Activating keep awake");
  });
}

RCT_EXPORT_METHOD(deactivate)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    [[UIApplication sharedApplication] setIdleTimerDisabled:NO];
    RCTLogInfo(@"Deactivating keep awake");
  });
}

@end
