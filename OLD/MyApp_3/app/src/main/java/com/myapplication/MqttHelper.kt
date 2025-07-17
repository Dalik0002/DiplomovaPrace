package com.myapplication

import org.eclipse.paho.client.mqttv3.MqttClient
import org.eclipse.paho.client.mqttv3.MqttConnectOptions
import org.eclipse.paho.client.mqttv3.MqttException
import org.eclipse.paho.client.mqttv3.MqttMessage
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence
import android.util.Log


class MqttHelper(
    private val brokerUrl: String,
    private val clientId: String,
    private val topic: String,
    private val messageCallback: (String) -> Unit
) {
    private val mqttClient = MqttClient(brokerUrl, clientId, MemoryPersistence())

    init {
        try {
            val options = MqttConnectOptions().apply { isCleanSession = true }
            mqttClient.connect(options)

            mqttClient.subscribe(topic) { _, message ->
                val text = String(message.payload)
                messageCallback(text)
            }
        } catch (e: MqttException) {
            Log.e("MQTT", "Chyba připojení: ${e.message}")
        }
    }

    fun sendMessage(message: String) {
        mqttClient.publish(topic, MqttMessage(message.toByteArray()))
    }

    fun disconnect() {
        mqttClient.disconnect()
    }
}
