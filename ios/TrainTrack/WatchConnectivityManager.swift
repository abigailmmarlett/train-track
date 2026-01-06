//
//  WatchConnectivityManager.swift
//  TrainTrack
//
//  Manages communication from iPhone to Apple Watch
//

import Foundation
import WatchConnectivity

@objc(WatchConnectivityManager)
class WatchConnectivityManager: NSObject {
    static let shared = WatchConnectivityManager()
    
    private var session: WCSession?
    
    override private init() {
        super.init()
        
        if WCSession.isSupported() {
            session = WCSession.default
            session?.delegate = self
            session?.activate()
        }
    }
    
    // Send timer state to watch
    func sendTimerState(currentLabel: String, remainingSeconds: Int, progress: Double, isCompleted: Bool) {
        guard let session = session, session.isReachable else {
            return
        }
        
        let message: [String: Any] = [
            "currentLabel": currentLabel,
            "remainingSeconds": remainingSeconds,
            "progress": progress,
            "isCompleted": isCompleted
        ]
        
        // Send message for immediate update
        session.sendMessage(message, replyHandler: nil) { error in
            print("Watch message error: \(error.localizedDescription)")
        }
        
        // Also update application context for persistence
        try? session.updateApplicationContext(message)
    }
}

extension WatchConnectivityManager: WCSessionDelegate {
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        if let error = error {
            print("WCSession activation error: \(error.localizedDescription)")
        }
    }
    
    func sessionDidBecomeInactive(_ session: WCSession) {
        // iOS only
    }
    
    func sessionDidDeactivate(_ session: WCSession) {
        // iOS only
        session.activate()
    }
}
