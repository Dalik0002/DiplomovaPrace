package com.myapplication

import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.ListView
import android.os.Bundle



class HomeFragment : Fragment() {
    private lateinit var mqttHelper: MqttHelper
    private lateinit var listView: ListView
    private lateinit var adapter: ArrayAdapter<String>
    private val messages = mutableListOf<String>()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        return inflater.inflate(R.layout.fragment_home, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        listView = view.findViewById(R.id.message_list)
        adapter = ArrayAdapter(requireContext(), android.R.layout.simple_list_item_1, messages)
        listView.adapter = adapter

        mqttHelper = MqttHelper("tcp://broker.hivemq.com:1883", "AndroidClient", "test/topic") { message ->
            activity?.runOnUiThread {
                messages.add(message)
                adapter.notifyDataSetChanged()
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        mqttHelper.disconnect()
    }
}
