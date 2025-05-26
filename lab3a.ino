const byte PLUS_PINS[8] = { 13, 12, 11, 10, 9, 8, 7, 6 };
const byte MINUS_PINS[8] = { A3, A2, A1, A0, 5, 4, 3, 2 };

const byte coolPattern[8][8] = {
  { 0, 2, 4, 6, 8, 10, 12, 14 },
  { 0, 2, 4, 6, 8, 10, 12, 14 },
  { 0, 2, 4, 6, 8, 10, 12, 14 },
  { 0, 2, 4, 6, 8, 10, 12, 14 },
  { 0, 2, 4, 6, 8, 10, 12, 14 },
  { 0, 2, 4, 6, 8, 10, 12, 14 },
  { 0, 2, 4, 6, 8, 10, 12, 14 },
  { 0, 2, 4, 6, 8, 10, 12, 14 }
};

#define NOTE_A5 880
#define NOTE_B5 988
#define NOTE_C6 1047
#define NOTE_D6 1175
#define NOTE_E6 1319
#define NOTE_F6 1397
#define NOTE_G6 1568

const int NOTE[7] = { NOTE_A5, NOTE_B5, NOTE_C6, NOTE_D6, NOTE_E6, NOTE_F6, NOTE_G6 };

const int speaker = 18;
const int button = 19;

void setup() {
  Serial.begin(57600);
  for (byte b : MINUS_PINS) {
    pinMode(b, OUTPUT);
    digitalWrite(b, HIGH);
  }
  for (byte b : PLUS_PINS) {
    pinMode(b, OUTPUT);
    digitalWrite(b, HIGH);
  }

  pinMode(speaker, OUTPUT);
  pinMode(button, INPUT_PULLUP);
}

void runTest() {
  for (byte bH : PLUS_PINS) {
    digitalWrite(bH, LOW);
    for (byte bL : MINUS_PINS) {
      digitalWrite(bL, LOW);
      delay(50);
      digitalWrite(bL, HIGH);
    }
    digitalWrite(bH, HIGH);
  }
}

void display(byte pattern[8][8]) {
  for (int i = 0; i < 8; i++) {
    for (int j = 0; j < 8; j++) {
      digitalWrite(MINUS_PINS[j], pattern[i][j] ? LOW : HIGH);
    }
    digitalWrite(PLUS_PINS[i], LOW);
    delayMicroseconds(100);
    digitalWrite(PLUS_PINS[i], HIGH);
  }
}


void displayBrightness(byte pattern[8][8]) {
  for (int k = 0; k < 14; k++) {
    for (int i = 0; i < 8; i++) {
      for (int j = 0; j < 8; j++) {
        if (pattern[i][j] > k) {
          digitalWrite(MINUS_PINS[j], LOW);
        } else {
          digitalWrite(MINUS_PINS[j], HIGH);
        }
      }
      digitalWrite(PLUS_PINS[i], LOW);
      delayMicroseconds(50);
      digitalWrite(PLUS_PINS[i], HIGH);
    }
  }
}

byte pattern[8][8];
int num = 0;
int stored = 7;

void loop() {
  //   runTest();
  //   display(coolPattern);
  // Serial.println(Serial.available());
  if (Serial.available() >= 9) {
    for (int i = 0; i < 8; i++) {
      char receivedChar = Serial.read();
      pattern[num][i] = (receivedChar == '1') ? 1 : 0;
    }
    num = (num + 1) % 8;

    stored = Serial.read() - '0' - 1;
    if (stored != 7) {
      tone(speaker, NOTE[stored], 144);
    }
  }

  if (digitalRead(button) == LOW) {
    for(int i = 0; i < 8; i++) {
      for(int j = 0; j < 8; j++) {
        pattern[i][j] = 0;
      }
    }
    stored = 7;
  }
  // if (stored != 7) {
  //   tone(speaker, NOTE[stored], 4 * 0.95);
  // }
  // }
  display(pattern);
}

// #define NOTE_B0 31
// #define NOTE_C1 33
// #define NOTE_CS1 35
// #define NOTE_D1 37
// #define NOTE_DS1 39
// #define NOTE_E1 41
// #define NOTE_F1 44
// #define NOTE_FS1 46
// #define NOTE_G1 49
// #define NOTE_GS1 52
// #define NOTE_A1 55
// #define NOTE_AS1 58
// #define NOTE_B1 62
// #define NOTE_C2 65
// #define NOTE_CS2 69
// #define NOTE_D2 73
// #define NOTE_DS2 78
// #define NOTE_E2 82
// #define NOTE_F2 87
// #define NOTE_FS2 93
// #define NOTE_G2 98
// #define NOTE_GS2 104
// #define NOTE_A2 110
// #define NOTE_AS2 117
// #define NOTE_B2 123
// #define NOTE_C3 131
// #define NOTE_CS3 139
// #define NOTE_D3 147
// #define NOTE_DS3 156
// #define NOTE_E3 165
// #define NOTE_F3 175
// #define NOTE_FS3 185
// #define NOTE_G3 196
// #define NOTE_GS3 208
// #define NOTE_A3 220
// #define NOTE_AS3 233
// #define NOTE_B3 247
// #define NOTE_C4 262
// #define NOTE_CS4 277
// #define NOTE_D4 294
// #define NOTE_DS4 311
// #define NOTE_E4 330
// #define NOTE_F4 349
// #define NOTE_FS4 370
// #define NOTE_G4 392
// #define NOTE_GS4 415
// #define NOTE_A4 440
// #define NOTE_AS4 466
// #define NOTE_B4 494
// #define NOTE_C5 523
// #define NOTE_CS5 554
// #define NOTE_D5 587
// #define NOTE_DS5 622
// #define NOTE_E5 659
// #define NOTE_F5 698
// #define NOTE_FS5 740
// #define NOTE_G5 784
// #define NOTE_GS5 831
// #define NOTE_A5 880
// #define NOTE_AS5 932
// #define NOTE_B5 988
// #define NOTE_C6 1047
// #define NOTE_CS6 1109
// #define NOTE_D6 1175
// #define NOTE_DS6 1245
// #define NOTE_E6 1319
// #define NOTE_F6 1397
// #define NOTE_FS6 1480
// #define NOTE_G6 1568
// #define NOTE_GS6 1661
// #define NOTE_A6 1760
// #define NOTE_AS6 1865
// #define NOTE_B6 1976
// #define NOTE_C7 2093
// #define NOTE_CS7 2217
// #define NOTE_D7 2349
// #define NOTE_DS7 2489
// #define NOTE_E7 2637
// #define NOTE_F7 2794
// #define NOTE_FS7 2960
// #define NOTE_G7 3136
// #define NOTE_GS7 3322
// #define NOTE_A7 3520
// #define NOTE_AS7 3729
// #define NOTE_B7 3951
// #define NOTE_C8 4186
// #define NOTE_CS8 4435
// #define NOTE_D8 4699
// #define NOTE_DS8 4978
// #define END -1
// #define NOTE_0 0 // Rest

// // notes in the song 'Erika'
// // Transposed to C Major for simplicity
// // Auf der Heide blüht ein kleines Blümelein
// int melody[] = {
//   NOTE_G4, NOTE_E4, NOTE_E4,  // Auf der Hei-de blüht
//   NOTE_G4, NOTE_E4, NOTE_E4,  // ein klei-nes
//   NOTE_F4, NOTE_D4, NOTE_D4,  // Blü-me-lein
//   NOTE_F4, NOTE_D4, NOTE_D4,  // (phrase repetition)
//   NOTE_E4, NOTE_C4, NOTE_C4, NOTE_C4, // (e.g. ...Herz so rein)
//   NOTE_0,                     // Rest

//   // und das heißt:
//   NOTE_A3, NOTE_A3, NOTE_A3, NOTE_B3,
//   // Erika!
//   NOTE_C4, NOTE_C4,
//   NOTE_0,                     // Rest

//   // Chorus: Denn ihr Herz ist voller Süßigkeit,
//   NOTE_G4, NOTE_G4, NOTE_G4, NOTE_E4,
//   NOTE_A4, NOTE_A4, NOTE_A4, NOTE_F4,
//   NOTE_G4, NOTE_F4, NOTE_E4, NOTE_D4,
//   NOTE_C4, NOTE_C4,
//   NOTE_0,                     // Rest

//   // zarter Duft entströmt dem Blütenkleid.
//   NOTE_G4, NOTE_G4, NOTE_G4, NOTE_E4,
//   NOTE_A4, NOTE_A4, NOTE_A4, NOTE_F4,
//   NOTE_G4, NOTE_F4, NOTE_E4, NOTE_D4,
//   NOTE_C4, NOTE_C4,
//   NOTE_0,                     // Rest
//   END
// };

// // note durations: 8 = quarter note, 4 = 8th note, 16 = half note etc.
// int noteDurations[] = {
//   4, 4, 8,  // Eighth, Eighth, Quarter
//   4, 4, 8,
//   4, 4, 8,
//   4, 4, 8,
//   4, 4, 8, 8, // Eighth, Eighth, Quarter, Quarter
//   8,          // Quarter Rest

//   4, 4, 4, 4,  // Four Eighths
//   8, 8,       // Quarter, Quarter
//   16,         // Half Rest (or adjust as needed for pacing)

//   // Chorus durations
//   4, 4, 4, 4,  // Four Eighths
//   4, 4, 4, 4,  // Four Eighths
//   4, 4, 4, 4,  // Four Eighths (descending run)
//   8, 16,      // Quarter, Half
//   8,          // Quarter Rest

//   4, 4, 4, 4,
//   4, 4, 4, 4,
//   4, 4, 4, 4,
//   8, 16,
//   8,
// };

// int speed = 90; // higher value, slower notes. Adjust to taste. (e.g., 60-75 might be more typical for a march tempo)

// // Example setup and loop to play the song on an Arduino
// // Assumes a piezo buzzer or speaker is connected to pin 19 (or change as needed)

// void setup() {
//   Serial.begin(9600); // Optional: for debugging note values
//   for (int thisNote = 0; melody[thisNote] != END; thisNote++) {
//     int noteDuration = speed * noteDurations[thisNote];
//     if (melody[thisNote] == NOTE_0) { // If it's a rest
//       delay(noteDuration);
//     } else {
//       tone(18, melody[thisNote], noteDuration * 0.95); // Play note for 95% of duration
//       Serial.println(melody[thisNote]); // Optional: print note value
//       delay(noteDuration); // Wait for the full note duration
//       noTone(19); // Stop the tone
//     }
//   }
// }

// void loop() {
//   // no need to repeat the melody, or you can call the play logic from setup again.
// }
