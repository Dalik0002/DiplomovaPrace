#include <stdint.h>
#include <HardwareSerial.h>

HardwareSerial mySerial(1); // UART1

//http://wiki.fluidnc.com/en/hardware/ESP32-S3_Pin_Reference


int mydata = 0; 
int mydataZ = 9999999;

uint8_t dataRequested = 0x00;
uint8_t errdataRequested = 0x01;
uint8_t sendingData = 0;
uint8_t receivedData = 0;


//////////////////////////////////// FUNCTION ///////////////////////////////////////////////////

void receiveDataFromESP32_S3(){

  // Zkontroluj, zda jsou v bufferu dostupná data
  if (mySerial.available() > 0) {

    String receivedData = mySerial.readStringUntil('\n'); // Čte až do nového řádku
    Serial.print("Přijato: ");
    Serial.println(receivedData);
  }


}

void sentToESP32_S3(){

  mySerial.println("Testovaci zprava z ESP32");
  Serial.println("Odeslano");
}


//////////////////////////////////// SETUP ///////////////////////////////////////////////////
void setup() {
  Serial.begin(115200);

  mySerial.begin(115200, SERIAL_8N1, 15, 2); // UART1: RX na GPIO16, TX na GPIO17

  Serial.println("UART RX Buffer Test - Připraven");

}


//////////////////////////////////// LOOP ///////////////////////////////////////////////////
void loop() {

  //sentToESP32_S3();

  receiveDataFromESP32_S3();

  delay(100);
}
