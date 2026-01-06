//
//  WatchConnectivityBridge.m
//  TrainTrack
//
//  React Native bridge module export
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WatchConnectivityBridge, NSObject)

RCT_EXTERN_METHOD(sendTimerState:(NSString *)currentLabel
                  remainingSeconds:(nonnull NSNumber *)remainingSeconds
                  progress:(nonnull NSNumber *)progress
                  isCompleted:(BOOL)isCompleted)

@end
