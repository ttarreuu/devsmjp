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

    override fun getMainComponentName(): String = "devsmjp"

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
            Log.e("MainActivity", "Error emitting notification click event: ${e.message}")
        }
    }

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
