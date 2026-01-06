//
//  WatchConnectivityManager.swift
//  TrainTrack
//
//  Manages communication from iPhone to Apple Watch
//

import Foundation
import WatchConnectivity
import os.log

@objc(WatchConnectivityManager)
class WatchConnectivityManager: NSObject {
    static let shared = WatchConnectivityManager()
    
    private var session: WCSession?
    private let logger = Logger(subsystem: "org.traintrack.TrainTrack", category: "WatchConnectivity")
    
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
        session.sendMessage(message, replyHandler: nil) { [weak self] error in
            self?.logger.error("Failed to send timer state to watch: \(error.localizedDescription, privacy: .public). Label: \(currentLabel, privacy: .public)")
        }
        
        // Also update application context for persistence
        do {
            try session.updateApplicationContext(message)
        } catch {
            logger.error("Failed to update application context: \(error.localizedDescription, privacy: .public)")
        }
    }
}

extension WatchConnectivityManager: WCSessionDelegate {
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        if let error = error {
            logger.error("WCSession activation error: \(error.localizedDescription, privacy: .public)")
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
