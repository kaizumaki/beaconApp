#include <NefryBeacon.h>

#include <Nefry.h>
#include <NefrySetting.h>
void setting(){
  Nefry.disableWifi();
}
NefrySetting nefrySetting(setting);

// UUID:6FAD7AFB-079E-4F42-8574-5DF2633B03CB
uint8_t uuid[] ={0x6F, 0xAD, 0x7A, 0xFB, 0x07, 0x9E, 0x4F, 0x42, 0x85, 0x74, 0x5D, 0xF2, 0x63, 0x3B, 0x03, 0xCB};
uint16_t major = 1;
uint16_t minor = 1;
NefryBeacon nefryBeacon;

void setup() {   
   if( !nefryBeacon.begin(uuid,major,minor)){//begin(UUID,major,minor);
      Serial.println("NefryBeacon Error");
   }
}

void loop() {

}
