package com.myapplication

import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.Button
import android.widget.Toast
import android.os.Bundle



class SettingsFragment : Fragment() {
    private lateinit var brokerInput: EditText
    private lateinit var topicInput: EditText
    private lateinit var saveButton: Button

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        return inflater.inflate(R.layout.fragment_settings, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        brokerInput = view.findViewById(R.id.brokerInput)
        topicInput = view.findViewById(R.id.topicInput)
        saveButton = view.findViewById(R.id.saveButton)

        saveButton.setOnClickListener {
            val broker = brokerInput.text.toString()
            val topic = topicInput.text.toString()

            if (broker.isNotEmpty() && topic.isNotEmpty()) {
                Toast.makeText(context, "Nastavení uloženo!", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
