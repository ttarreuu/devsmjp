package com.devsmjp

import android.content.Intent
import android.util.Log
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.modules.core.DeviceEventManagerModule

class MainActivity : ReactActivity() {

    private var isOnNewIntent: Boolean = false

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    override fun getMainComponentName(): String = "devsmjp"

    /**
     * Handles the intent when the activity is created or a new intent is received.
     */
    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        isOnNewIntent = true
        foregroundEmitter(intent)
    }

    override fun onStart() {
        super.onStart()
        if (!isOnNewIntent) {
            foregroundEmitter(intent)
        }
    }

    /**
     * Emits the data received from the notification click to the JavaScript layer.
     */
    private fun foregroundEmitter(intent: Intent?) {
        val main = intent?.getStringExtra("mainOnPress")
        val btn = intent?.getStringExtra("buttonOnPress")

        val map: WritableMap = Arguments.createMap().apply {
            main?.let { putString("main", it) }
            btn?.let { putString("button", it) }
        }

        try {
            reactInstanceManager.currentReactContext
                ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit("notificationClickHandle", map)
        } catch (e: Exception) {
            Log.e("Superlog", "Caught Exception: ${e.message}")
        }
    }


    /**
     * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
     * which allows you to enable New Architecture with a single boolean flag [fabricEnabled].
     */
    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}