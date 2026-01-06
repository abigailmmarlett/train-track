//
//  WatchConnectivityManager.swift
//  TrainTrackWatch WatchKit Extension
//
//  Manages communication between iPhone and Apple Watch
//

import Foundation
import WatchConnectivity
import SwiftUI

class WatchConnectivityManager: NSObject, ObservableObject, WCSessionDelegate {
    static let shared = WatchConnectivityManager()
    
    @Published var isConnected = false
    @Published var currentLabel = "Ready"
    @Published var remainingTime = "00:00"
    @Published var progress: CGFloat = 0.0
    
    private var lastSectionLabel = ""
    private var session: WCSession?
    
    override private init() {
        super.init()
        
        if WCSession.isSupported() {
            session = WCSession.default
            session?.delegate = self
            session?.activate()
        }
    }
    
    // MARK: - WCSessionDelegate
    
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        DispatchQueue.main.async {
            self.isConnected = session.isReachable
        }
    }
    
    func sessionReachabilityDidChange(_ session: WCSession) {
        DispatchQueue.main.async {
            self.isConnected = session.isReachable
        }
    }
    
    func session(_ session: WCSession, didReceiveMessage message: [String : Any]) {
        DispatchQueue.main.async {
            self.handleMessage(message)
        }
    }
    
    func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String : Any]) {
        DispatchQueue.main.async {
            self.handleMessage(applicationContext)
        }
    }
    
    // MARK: - Message Handling
    
    private func handleMessage(_ message: [String: Any]) {
        // Update current section label
        if let label = message["currentLabel"] as? String {
            // Check if section changed (for haptic feedback)
            if label != lastSectionLabel && !lastSectionLabel.isEmpty && label != "Complete" {
                // Trigger haptic when section changes
                triggerHaptic()
            }
            lastSectionLabel = label
            currentLabel = label
        }
        
        // Update remaining time
        if let seconds = message["remainingSeconds"] as? Int {
            remainingTime = formatTime(seconds)
        }
        
        // Update progress (0 to 1)
        if let progressValue = message["progress"] as? Double {
            progress = CGFloat(progressValue)
        }
        
        // Handle completion
        if let isCompleted = message["isCompleted"] as? Bool, isCompleted {
            currentLabel = "Complete"
            remainingTime = "00:00"
            progress = 1.0
            triggerHaptic()
        }
    }
    
    // MARK: - Helpers
    
    private func formatTime(_ seconds: Int) -> String {
        let mins = seconds / 60
        let secs = seconds % 60
        return String(format: "%02d:%02d", mins, secs)
    }
    
    private func triggerHaptic() {
        // Subtle haptic notification when section ends
        WKInterfaceDevice.current().play(.notification)
    }
}
