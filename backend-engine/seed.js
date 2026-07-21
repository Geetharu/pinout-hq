const { MongoClient } = require('mongodb');

// Mongoose automatically looks in the lowercase pluralized 'hardwares' collection
const COLLECTION_NAME = 'hardwares'; 

const seedData = [
  {
    slug: "esp32-wroom-32",
    name: "ESP32 WROOM 32",
    category: "MCU",
    brand: "Espressif Systems",
    sku: "ESP32-WROOM-32D",
    overview: "A powerful, generic WiFi and Bluetooth dual mode microcontroller module targeting a wide variety of applications from low power sensor networks to demanding tasks like voice encoding and music streaming.",
    seo: {
      metaTitle: "ESP32 WROOM 32 Pinout Diagram & Specs",
      metaDescription: "Complete GPIO pinout diagram, specifications, and hardware matrix for ESP32 WROOM 32 microcontroller.",
      keywords: ["ESP32", "Espressif", "MCU", "WiFi", "Bluetooth", "Pinout", "IoT"]
    },
    specifications: {
      operatingVoltage: "3.3V",
      pinCount: 38,
      protocols: ["WiFi", "Bluetooth", "SPI", "I2C", "UART", "PWM", "ADC", "DAC"],
      cpuFrequency: "Up to 240 MHz",
      sram: "520 KB",
      flashMemory: "4 MB",
      adcChannels: "18 channels (12-bit SAR)",
      dacChannels: "2 channels (8-bit)",
      gpioCount: 34,
      deepSleepCurrent: "5 µA",
      pinout: [
        { pinNumber: 1, label: "GND", gpio: null, function: "Power", description: "Ground reference" },
        { pinNumber: 2, label: "3V3", gpio: null, function: "Power", description: "3.3V Power Supply" },
        { pinNumber: 3, label: "EN", gpio: null, function: "Control", description: "Chip enable signal (Active High)" },
        { pinNumber: 4, label: "SENSOR_VP", gpio: 36, function: "Analog Input", description: "ADC1 Channel 0 (Input only)" },
        { pinNumber: 5, label: "SENSOR_VN", gpio: 39, function: "Analog Input", description: "ADC1 Channel 3 (Input only)" },
        { pinNumber: 13, label: "IO14", gpio: 14, function: "General I/O", description: "HS2_CLK, ADC2 Channel 6, Touch 6" },
        { pinNumber: 33, label: "IO21", gpio: 21, function: "General I/O", description: "Default I2C Data Line (SDA)" },
        { pinNumber: 36, label: "IO22", gpio: 22, function: "General I/O", description: "Default I2C Clock Line (SCL)" },
        { pinNumber: 34, label: "RXD0", gpio: 3, function: "UART", description: "UART Receive Pin (Flashing and debugging)" },
        { pinNumber: 35, label: "TXD0", gpio: 1, function: "UART", description: "UART Transmit Pin (Flashing and debugging)" }
      ]
    },
    vendorOffers: [
      {
        vendorName: "Adafruit",
        url: "https://www.adafruit.com/product/3320",
        price: 4.95,
        currency: "USD",
        inStock: true,
        lastUpdated: new Date()
      }
    ],
    lowestPrice: 4.95,
    isAvailable: true,
    isSponsored: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slug: "dht22-temperature-humidity",
    name: "DHT22 Environmental Sensor",
    category: "SENSOR",
    brand: "Aosong",
    sku: "DHT22-AM2302",
    overview: "A basic, low cost digital temperature and humidity sensor utilizing a capacitive humidity sensor and a thermistor to measure the surrounding air, spitting out a digital signal on the data pin.",
    seo: {
      metaTitle: "DHT22 Temperature & Humidity Sensor Pinout & Specs",
      metaDescription: "Pinout diagram and specifications for DHT22 environmental sensor module.",
      keywords: ["DHT22", "AM2302", "Sensor", "Temperature", "Humidity", "Pinout"]
    },
    specifications: {
      operatingVoltage: "3.3V to 5V",
      pinCount: 4,
      protocols: ["Single Wire Digital"],
      humidityRange: "0% to 100% RH",
      humidityAccuracy: "±2% RH",
      temperatureRange: "-40°C to +80°C",
      temperatureAccuracy: "±0.5°C",
      samplingRate: "0.5 Hz (Once every 2 seconds)",
      pinout: [
        { pinNumber: 1, label: "VCC", gpio: null, function: "Power", description: "Power supply (3.3V to 5V)" },
        { pinNumber: 2, label: "DATA", gpio: null, function: "Data", description: "Digital communication line (Requires 10k pull up resistor)" },
        { pinNumber: 3, label: "NC", gpio: null, function: "No Connect", description: "Not connected internally" },
        { pinNumber: 4, label: "GND", gpio: null, function: "Power", description: "Ground reference" }
      ]
    },
    vendorOffers: [
      {
        vendorName: "SparkFun",
        url: "https://www.sparkfun.com/products/10167",
        price: 9.95,
        currency: "USD",
        inStock: true,
        lastUpdated: new Date()
      }
    ],
    lowestPrice: 9.95,
    isAvailable: true,
    isSponsored: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slug: "ssd1306-oled-display",
    name: "SSD1306 0.96 Inch OLED",
    category: "DISPLAY",
    brand: "Solomon Systech",
    sku: "SSD1306-096-I2C",
    overview: "A monochrome graphic display module offering high contrast without needing a backlight. It communicates via standard I2C, making it ideal for compact embedded dashboards and telemetry readouts.",
    seo: {
      metaTitle: "SSD1306 0.96 Inch OLED Display Pinout & Specs",
      metaDescription: "Complete pinout diagram and specs for SSD1306 I2C OLED graphical display.",
      keywords: ["SSD1306", "OLED", "Display", "I2C", "Arduino", "ESP32", "Pinout"]
    },
    specifications: {
      operatingVoltage: "3.3V to 5V",
      pinCount: 4,
      protocols: ["I2C", "SPI"],
      resolution: "128 x 64 pixels",
      screenSize: "0.96 inches diagonal",
      viewingAngle: "> 160 degrees",
      activePower: "20 mA",
      sleepCurrent: "< 10 µA",
      pinout: [
        { pinNumber: 1, label: "GND", gpio: null, function: "Power", description: "Ground reference" },
        { pinNumber: 2, label: "VCC", gpio: null, function: "Power", description: "Power supply (3.3V to 5V)" },
        { pinNumber: 3, label: "SCL", gpio: null, function: "I2C Clock", description: "Serial Clock Line" },
        { pinNumber: 4, label: "SDA", gpio: null, function: "I2C Data", description: "Serial Data Line" }
      ]
    },
    vendorOffers: [
      {
        vendorName: "Amazon MakerStore",
        url: "https://amazon.com",
        price: 5.50,
        currency: "USD",
        inStock: true,
        lastUpdated: new Date()
      }
    ],
    lowestPrice: 5.50,
    isAvailable: true,
    isSponsored: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slug: "arduino-uno-r3",
    name: "Arduino Uno R3",
    category: "MCU",
    brand: "Arduino",
    sku: "A000066",
    overview: "The classic microcontroller board powered by the ATmega328P. It features standard female headers for rapid electronics prototyping, shield expansion, and educational Maker projects.",
    seo: {
      metaTitle: "Arduino Uno R3 Pinout Diagram & Specs",
      metaDescription: "Full pinout diagram, GPIO mapping, and technical specs for Arduino Uno R3.",
      keywords: ["Arduino", "Uno", "R3", "ATmega328P", "MCU", "Pinout"]
    },
    specifications: {
      operatingVoltage: "5V",
      pinCount: 32,
      protocols: ["UART", "I2C", "SPI", "PWM", "ADC"],
      cpuFrequency: "16 MHz",
      flashMemory: "32 KB",
      sram: "2 KB",
      eeprom: "1 KB",
      digitalPins: 14,
      analogInputPins: 6,
      pinout: [
        { pinNumber: 1, label: "TX", gpio: 1, function: "UART", description: "Serial Transmit" },
        { pinNumber: 2, label: "RX", gpio: 0, function: "UART", description: "Serial Receive" },
        { pinNumber: 14, label: "PIN 13", gpio: 13, function: "General I/O", description: "Digital I/O and Built in LED" },
        { pinNumber: 19, label: "A4", gpio: 18, function: "Analog / I2C", description: "Analog Input 4 or I2C SDA" },
        { pinNumber: 20, label: "A5", gpio: 19, function: "Analog / I2C", description: "Analog Input 5 or I2C SCL" }
      ]
    },
    vendorOffers: [
      {
        vendorName: "Official Arduino Store",
        url: "https://store.arduino.cc/products/arduino-uno-rev3",
        price: 27.60,
        currency: "USD",
        inStock: true,
        lastUpdated: new Date()
      }
    ],
    lowestPrice: 27.60,
    isAvailable: true,
    isSponsored: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slug: "raspberry-pi-pico",
    name: "Raspberry Pi Pico",
    category: "MCU",
    brand: "Raspberry Pi Foundation",
    sku: "SC0915",
    overview: "A high performance microcontroller board built around the custom RP2040 silicon chip. It offers dual ARM cores, programmable I/O state machines, and ultra low cost telemetry execution.",
    seo: {
      metaTitle: "Raspberry Pi Pico Pinout & Specs (RP2040)",
      metaDescription: "Complete GPIO pinout diagram and specs for Raspberry Pi Pico RP2040 board.",
      keywords: ["Raspberry Pi", "Pico", "RP2040", "MCU", "Pinout", "Python"]
    },
    specifications: {
      operatingVoltage: "3.3V",
      pinCount: 40,
      protocols: ["SPI", "I2C", "UART", "PWM", "PIO", "USB 1.1"],
      cpuFrequency: "133 MHz Dual Core",
      sram: "264 KB",
      onboardFlash: "2 MB QSPI",
      gpioPins: 26,
      adcChannels: "3 channels (12-bit)",
      programmableIO: "8 PIO state machines",
      pinout: [
        { pinNumber: 1, label: "GP0", gpio: 0, function: "General I/O", description: "UART0 TX, I2C0 SDA, SPI0 RX" },
        { pinNumber: 2, label: "GP1", gpio: 1, function: "General I/O", description: "UART0 RX, I2C0 SCL, SPI0 CSn" },
        { pinNumber: 3, label: "GND", gpio: null, function: "Power", description: "Ground reference" },
        { pinNumber: 36, label: "3V3_OUT", gpio: null, function: "Power", description: "Generated 3.3V output to power external sensors" },
        { pinNumber: 39, label: "VSYS", gpio: null, function: "Power", description: "Main system input voltage (1.8V to 5.5V)" }
      ]
    },
    vendorOffers: [
      {
        vendorName: "PiShop",
        url: "https://www.pishop.us/product/raspberry-pi-pico/",
        price: 4.00,
        currency: "USD",
        inStock: true,
        lastUpdated: new Date()
      }
    ],
    lowestPrice: 4.00,
    isAvailable: true,
    isSponsored: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function runSeed() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/pinout_hq";
  console.log("Connecting to database server...");
  
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected successfully to database!");

    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);

    console.log(`Checking existing records in collection: ${COLLECTION_NAME}...`);
    const existingCount = await collection.countDocuments();
    console.log(`Found ${existingCount} existing records.`);

    console.log("Clearing old data to insert fresh schema-compliant Golden Starter Pack...");
    await collection.deleteMany({});

    console.log("Inserting new hardware specifications...");
    const result = await collection.insertMany(seedData);

    console.log(`Database successfully seeded! Inserted ${result.insertedCount} hardware modules.`);
    console.log("You can now refresh your live custom domain to view the populated matrix!");
  } catch (error) {
    console.error("An error occurred while seeding the database:", error);
  } finally {
    await client.close();
    console.log("Database connection closed.");
    process.exit(0);
  }
}

runSeed();