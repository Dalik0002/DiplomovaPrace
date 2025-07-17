package com.myapplication

import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.Button
import android.widget.Toast
import android.os.Bundle


class SendFragment : Fragment() {
    private lateinit var mqttHelper: MqttHelper
    private lateinit var messageInput: EditText
    private lateinit var sendButton: Button

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        return inflater.inflate(R.layout.fragment_send, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        messageInput = view.findViewById(R.id.messageInput)
        sendButton = view.findViewById(R.id.sendButton)

        mqttHelper = MqttHelper("tcp://broker.hivemq.com:1883", "AndroidClient", "test/topic") {}

        sendButton.setOnClickListener {
            val message = messageInput.text.toString()
            if (message.isNotEmpty()) {
                mqttHelper.sendMessage(message)
                messageInput.text.clear()
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        mqttHelper.disconnect()
    }
}
