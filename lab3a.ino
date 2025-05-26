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
  display(pattern);
}