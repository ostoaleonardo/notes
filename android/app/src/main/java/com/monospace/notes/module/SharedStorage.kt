package com.monospace.notes.module

import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class SharedStorage(private var context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {

    override fun getName(): String {
        return "SharedStorage"
    }

    @ReactMethod
    fun setItem(key: String, data: String?) {
        val editor = context.getSharedPreferences("widgets", Context.MODE_PRIVATE).edit()
        editor.putString(key, data)
        editor.apply()
    }
}