//
//  ContentView.swift
//  TrainTrackWatch WatchKit Extension
//
//  Display-only Watch UI for timer companion
//

import SwiftUI

struct ContentView: View {
    @ObservedObject var connectivity = WatchConnectivityManager.shared
    
    var body: some View {
        ZStack {
            Color.black.edgesIgnoringSafeArea(.all)
            
            if connectivity.isConnected {
                VStack(spacing: 16) {
                    // Section label - large and glanceable
                    Text(connectivity.currentLabel)
                        .font(.system(size: 24, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                        .multilineTextAlignment(.center)
                        .lineLimit(2)
                        .minimumScaleFactor(0.8)
                        .padding(.horizontal, 8)
                    
                    // Circular countdown ring with time
                    ZStack {
                        // Background ring
                        Circle()
                            .stroke(Color.gray.opacity(0.3), lineWidth: 8)
                            .frame(width: 120, height: 120)
                        
                        // Progress ring
                        Circle()
                            .trim(from: 0, to: connectivity.progress)
                            .stroke(
                                Color.blue,
                                style: StrokeStyle(lineWidth: 8, lineCap: .round)
                            )
                            .frame(width: 120, height: 120)
                            .rotationEffect(.degrees(-90))
                            .animation(.linear(duration: 0.3), value: connectivity.progress)
                        
                        // Remaining time
                        Text(connectivity.remainingTime)
                            .font(.system(size: 32, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                            .monospacedDigit()
                    }
                    
                    Spacer()
                }
                .padding(.top, 20)
            } else {
                // No connection state
                VStack(spacing: 12) {
                    Image(systemName: "iphone.slash")
                        .font(.system(size: 40))
                        .foregroundColor(.gray)
                    
                    Text("Waiting for iPhone")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.gray)
                        .multilineTextAlignment(.center)
                }
            }
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
