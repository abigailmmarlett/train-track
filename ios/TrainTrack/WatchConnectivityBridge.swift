//
//  WatchConnectivityBridge.swift
//  TrainTrack
//
//  React Native bridge for Watch connectivity
//

import Foundation
import React

@objc(WatchConnectivityBridge)
class WatchConnectivityBridge: NSObject {
    
    @objc
    func sendTimerState(
        _ currentLabel: String,
        remainingSeconds: NSNumber,
        progress: NSNumber,
        isCompleted: Bool
    ) {
        WatchConnectivityManager.shared.sendTimerState(
            currentLabel: currentLabel,
            remainingSeconds: remainingSeconds.intValue,
            progress: progress.doubleValue,
            isCompleted: isCompleted
        )
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
}
