import { Request, Response } from 'express';
import { z } from 'zod';
import Component from '../models/Component';
import { executeVendorScrape, ScrapeVendorInputSchema } from '../services/scrapeVendor';

export const getComponents = async (req: Request, res: Response): Promise<void> => {
  try {
    const components = await Component.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: components.length, data: components });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error while fetching components', error: error.message });
  }
};

export const getComponentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const component = await Component.findById(req.params.id);
    if (!component) {
      res.status(404).json({ success: false, message: 'Hardware component not found' });
      return;
    }
    res.status(200).json({ success: true, data: component });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching component details', error: error.message });
  }
};

export const createComponent = async (req: Request, res: Response): Promise<void> => {
  try {
    const newComponent = await Component.create(req.body);
    res.status(201).json({ success: true, data: newComponent });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Failed to create component', error: error.message });
  }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ──────────────────────────────────────────────────────────────
// Zod schema that the Pro model's JSON output must satisfy
// ──────────────────────────────────────────────────────────────
const ProArticleSchema = z.object({
  title: z.string().min(1, 'title is required'),
  metaDescription: z.string().min(1, 'metaDescription is required'),
  articleMarkdown: z
    .string()
    .min(1500, 'articleMarkdown must be at least 1,500 characters to avoid truncation'),
  tags: z.array(z.string()).min(1, 'at least one tag is required'),
});

type ProArticle = z.infer<typeof ProArticleSchema>;

// ──────────────────────────────────────────────────────────────
// Flagship Pro model regeneration  —  65 536 token limit
// ──────────────────────────────────────────────────────────────
async function regenerateWithProModel(
  name: string,
  vendor: string,
  specs: Record<string, any>,
): Promise<ProArticle> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const modelName = process.env.PRIMARY_AI_MODEL || 'gemini-3.1-pro-preview';
  const specsString = JSON.stringify(specs, null, 2);

  const systemPrompt = `You are the Editor in Chief and lead hardware journalist for PinoutHQ.
Write an exhaustive, captivating 1 800 word magazine editorial review and technical guide for: "${name}" manufactured by "${vendor}".
Use these scraped raw specifications as your factual foundation:
${specsString}

CRITICAL EDITORIAL AND WRITING RULES:
1. Humanized Style: Write in an engaging, authoritative, magazine review style similar to top gaming and technology publications. Use natural transitions and engaging storytelling.
2. Absolute Dash Ban: Do NOT use dashes or hyphens as punctuation inside your paragraphs or sentences. Use commas, parentheses, colons, or separate sentences instead.
3. Dynamic Structure: Create custom Markdown headings (##, ###) that fit this specific component. Do not force generic software sections. If it is a programmable microcontroller, include real C++ Arduino code snippets.
4. Comprehensive Coverage: Explain the silicon architecture, real world edge computing applications, pinout routing best practices, power rail tolerances, and common prototyping mistakes.
5. FAQ Section: End the Markdown article with a heading titled "## Frequently Asked Questions" followed by exactly 6 numbered, highly technical Q&As.
6. Word Count: Your articleMarkdown MUST exceed 1 500 words. Be thorough and technical.

You MUST respond ONLY with a valid JSON object matching this exact schema:
{
  "title": "An engaging, SEO optimized magazine title without hyphens",
  "metaDescription": "A 150 character SEO summary of the hardware review",
  "articleMarkdown": "The entire 1 800 word magazine article in clean Markdown format",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4"]
}`;

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🧠 Pro model regeneration via ${modelName} (Attempt ${attempt}/${maxRetries})...`);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              maxOutputTokens: 65536,
              temperature: 0.35,
            },
          }),
        },
      );

      if (response.status === 429) {
        console.warn(`⏳ Rate limit hit. Pausing ${attempt * 5}s before retry...`);
        await sleep(attempt * 5000);
        continue;
      }

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        throw new Error(`Google API returned HTTP ${response.status}: ${errorBody}`);
      }

      const data: any = await response.json();
      const rawText: string | undefined =
        data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error('AI response had no text parts');
      }

      // Parse JSON
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(rawText);
      } catch (parseError: any) {
        console.error(`⚠️ JSON parse error on attempt ${attempt}:`, parseError.message);
        if (attempt === maxRetries) throw new Error('AI returned malformed JSON after all retries');
        await sleep(3000);
        continue;
      }

      // Validate with structured schema
      const validation = ProArticleSchema.safeParse(parsed);
      if (!validation.success) {
        console.error(`⚠️ Schema validation failed on attempt ${attempt}:`, validation.error.format());
        if (attempt === maxRetries) {
          throw new Error(`AI output failed schema validation: ${JSON.stringify(validation.error.format())}`);
        }
        await sleep(3000);
        continue;
      }

      return validation.data;
    } catch (error: any) {
      console.error(`⚠️ Pro regeneration error on attempt ${attempt}:`, error.message);
      if (attempt === maxRetries) throw error;
      await sleep(3000);
    }
  }

  throw new Error('All Pro model retry attempts exhausted');
}

// ──────────────────────────────────────────────────────────────
// Pro article fallback (identical to getFallbackMarkdown but
// returns a ProArticle-conforming object)
// ──────────────────────────────────────────────────────────────
function getProFallbackArticle(name: string, vendor: string): ProArticle {
  const fallback = getFallbackMarkdown(name, vendor);
  return {
    title: fallback.title,
    metaDescription: fallback.metaDescription,
    articleMarkdown: fallback.articleMarkdown,
    tags: fallback.tags,
  };
}

// ──────────────────────────────────────────────────────────────
// Regenerate endpoint handler  —  Pro → Flash → static fallback
// ──────────────────────────────────────────────────────────────
export const regenerateComponent = async (req: Request, res: Response): Promise<void> => {
  try {
    const component = await Component.findById(req.params.id);
    if (!component) {
      res.status(404).json({ success: false, message: 'Hardware component not found' });
      return;
    }

    console.log(`🔄 Regeneration requested for [${component.name}] (${component._id})`);

    // Tier 1: Pro model
    let article: ProArticle;
    let modelUsed = 'fallback-static';
    try {
      article = await regenerateWithProModel(
        component.name,
        component.vendor,
        component.specifications,
      );
      modelUsed = process.env.PRIMARY_AI_MODEL || 'gemini-3.1-pro-preview';
      console.log(`✅ Pro model regeneration succeeded for [${component.name}]`);
    } catch (proError: any) {
      console.warn(`⚠️ Pro model failed (${proError.message}), trying Flash fallback...`);
      // Tier 2: Flash model
      try {
        const flashResult = await generateDynamicArticleAI(
          component.name,
          component.vendor,
          component.specifications,
        );
        // The Flash fallback can return an untyped object — validate via schema
        const flashValidation = ProArticleSchema.safeParse(flashResult);
        if (flashValidation.success) {
          article = flashValidation.data;
          modelUsed = process.env.FALLBACK_AI_MODEL || 'gemini-1.5-flash';
          console.log(`✅ Flash fallback regeneration succeeded for [${component.name}]`);
        } else {
          throw new Error('Flash output failed schema validation');
        }
      } catch (flashError: any) {
        console.warn(`⚠️ Flash fallback also failed (${flashError.message}), using static fallback.`);
        // Tier 3: static fallback
        article = getProFallbackArticle(component.name, component.vendor);
        modelUsed = 'fallback-static';
      }
    }

    const wordCount = article.articleMarkdown.split(/\s+/).filter(Boolean).length;

    // Persist the fresh article onto the component
    component.specifications = {
      ...component.specifications,
      seoArticle: article,
      lastRegeneratedAt: new Date().toISOString(),
      regeneratedBy: modelUsed,
      wordCount,
    };
    await component.save();

    console.log(
      `✅ Regenerated [${component.name}] — ${wordCount} words, ${article.articleMarkdown.length} chars via ${modelUsed}`,
    );

    res.status(200).json({
      success: true,
      data: {
        id: component._id,
        name: component.name,
        vendor: component.vendor,
        title: article.title,
        metaDescription: article.metaDescription,
        tags: article.tags,
        wordCount,
        model: modelUsed,
        articleMarkdown: article.articleMarkdown,
      },
    });
  } catch (error: any) {
    console.error('🔥 Regeneration endpoint error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Regeneration failed',
      error: error.message,
    });
  }
};

// ──────────────────────────────────────────────────────────────
// Existing functions below (unchanged)
// ──────────────────────────────────────────────────────────────

/**
 * Autonomous Magazine-Grade AI Engine (legacy Flash path)
 * Generates humanized 1,800-word editorial reviews with 6 FAQs and zero dashes in prose
 */
async function generateDynamicArticleAI(name: string, vendor: string, specs: Record<string, any>) {
  const specsString = JSON.stringify(specs, null, 2);
  
  const systemPrompt = `You are the Editor in Chief and lead hardware journalist for PinoutHQ.
Write an exhaustive, captivating 1,800-word magazine editorial review and technical guide for: "${name}" manufactured by "${vendor}".
Use these scraped raw specifications as your factual foundation:
${specsString}

CRITICAL EDITORIAL AND WRITING RULES:
1. Humanized Style: Write in an engaging, authoritative, magazine review style similar to top gaming and technology publications. Use natural transitions and engaging storytelling.
2. Absolute Dash Ban: Do NOT use dashes or hyphens as punctuation inside your paragraphs or sentences. You must use commas, parentheses, colons, or separate sentences instead.
3. Dynamic Structure: Create custom Markdown headings (##, ###) that fit this specific component. Do not force generic software sections if the item is a simple sensor or passive module. If it is a programmable microcontroller, include real C++ Arduino code snippets.
4. Comprehensive Coverage: Explain the silicon architecture, real world edge computing applications, pinout routing best practices, power rail tolerances, and common prototyping mistakes.
5. FAQ Section: End the Markdown article with a heading titled "## Frequently Asked Questions" followed by exactly 6 numbered, highly technical Q&As (e.g., "1. What is the operating voltage...").

You MUST respond ONLY with a valid JSON object matching this exact schema:
{
  "title": "An engaging, SEO optimized magazine title without hyphens",
  "metaDescription": "A 150 character SEO summary of the hardware review",
  "articleMarkdown": "The entire 1,800 word magazine article in clean Markdown format, including all dynamic headings, technical analysis, code harnesses, and the 6 numbered FAQs at the bottom.",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4"]
}`;

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    console.warn("⚠️ No GEMINI_API_KEY found in environment. Using high precision markdown fallback.");
    return getFallbackMarkdown(name, vendor);
  }

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const flashModel = process.env.FALLBACK_AI_MODEL || 'gemini-3.5-flash';
      console.log(`🧠 Generating Magazine AI Review via ${flashModel} (Attempt ${attempt}/${maxRetries})...`);
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${flashModel}:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.35 }
        })
      });

      if (response.status === 429) {
        console.warn(`⏳ Gemini Rate Limit (HTTP 429). Pausing for ${attempt * 5} seconds before automatic retry...`);
        await sleep(attempt * 5000);
        continue;
      }

      if (!response.ok) {
        throw new Error(`Google API returned HTTP status ${response.status}`);
      }

      const data: any = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        return JSON.parse(rawText);
      }
    } catch (error: any) {
      console.error(`⚠️ AI Generation Error on attempt ${attempt}:`, error.message);
      if (attempt === maxRetries) break;
      await sleep(3000);
    }
  }

  console.log("⚠️ All AI retry attempts exhausted. Applying high precision markdown fallback.");
  return getFallbackMarkdown(name, vendor);
}

function getFallbackMarkdown(name: string, vendor: string) {
  return {
    title: `Why the ${name} is an Essential Building Block for IoT Engineers`,
    metaDescription: `Complete engineering review, pinout routing analysis, and technical specifications for the ${name} by ${vendor}.`,
    articleMarkdown: `## The Silicon Architecture and Market Impact

Few components have captured the attention of embedded systems developers quite like the ${name} engineered by ${vendor}. Designed to seamlessly bridge the gap between initial tabletop prototyping and robust industrial edge computing, this module delivers remarkable processing stability and superior noise immunity. Whether you are building remote environmental telemetry gateways or automated robotics controllers, understanding the core physical layer tolerances of this hardware is essential for long term reliability.

The ${name} sits at a fascinating intersection of raw computational capability and practical embedded design philosophy. Its silicon architecture reflects years of iterative engineering refinement, balancing power consumption against processing throughput in a way that few competing modules can match. When you examine the die layout and the internal bus architecture, you begin to appreciate the thoughtful decisions the design team made around signal integrity, clock distribution, and power domain separation. These are not arbitrary engineering choices; they represent a carefully considered approach to solving real world deployment challenges that embedded engineers face daily.

In the rapidly evolving landscape of edge computing and distributed sensor networks, the importance of selecting a robust, well documented hardware platform cannot be overstated. The ${name} distinguishes itself through a combination of familiar development tooling support, generous GPIO availability, and a proven track record of reliability across diverse operating conditions. Whether your application demands real time sensor fusion, wireless telemetry aggregation, or deterministic control loop execution, this module provides a solid foundation upon which to build production ready systems.

## Pinout Routing and Communication Bus Interfaces

Interfacing effectively with the ${name} requires careful attention to logic level tolerances and communication bus timing. When mapping out your printed circuit board traces, keeping high frequency clock lines physically separated from sensitive analog input signals prevents electromagnetic interference and unwanted capacitive coupling. Utilizing standard industry communication buses ensures smooth compatibility across modern microcontroller architectures, while installing external pull up resistors guarantees sharp digital waveforms across extended cable runs.

A common mistake among engineers new to this platform involves neglecting to account for trace impedance matching on high speed communication lines. The SPI and I2C buses integrated into the ${name} can operate at speeds that demand careful PCB layout practices. For SPI connections exceeding 10 MHz, keeping trace lengths under 10 centimeters and avoiding sharp 90 degree corners helps maintain signal integrity. For I2C, the pull up resistor values should be calculated based on the total bus capacitance and the desired clock speed, with typical values ranging from 2.2 kiloohms for standard mode to 4.7 kiloohms for low power applications.

When designing your printed circuit board, consider dedicating at least one solid ground plane layer to minimize ground bounce and reduce electromagnetic emissions. The ${name} benefits enormously from a low impedance ground return path, particularly when driving high current outputs or communicating over long distance RS485 links. Placing decoupling capacitors as close as possible to each power pin, with values of 0.1 microfarad for high frequency noise and 10 microfarad for bulk storage, ensures stable operation across the full operating temperature range.

For engineers integrating multiple peripherals on the same bus, careful address planning prevents conflicts and reduces debug time. The ${name} supports standard 7 bit and 10 bit I2C addressing, and many sensors offer configurable address pins that allow multiple identical devices to share the same bus. Document your address assignments early in the design process to avoid costly board respins later.

## Power Rail Stability and Thermal Dissipation

Unstable power rail regulation remains one of the most frequent causes of intermittent microcontroller resets during intensive field testing. The ${name} operates within a strict voltage envelope where sudden current demands during wireless transmission can cause momentary brownout drops on the supply rail. Placing a combination of bulk electrolytic capacitors and fast ceramic decoupling capacitors directly across the voltage supply header pins ensures continuous and stable operation under maximum processing loads.

The power delivery network design deserves as much attention as the firmware running on the module. A well designed power supply system begins with selecting an appropriate voltage regulator that can supply sufficient current with low output ripple. Linear regulators offer clean output with minimal noise but generate heat at higher current draws, while switching regulators provide excellent efficiency at the cost of potential switching noise that can couple into sensitive analog measurement circuits. For battery powered deployments, a low quiescent current buck boost converter enables operation across the full battery voltage range without wasting energy as heat.

Thermal management becomes critical when the ${name} is deployed inside sealed enclosures, particularly in outdoor environments where solar radiation can raise internal temperatures well above ambient. The module's silicon junction temperature should never exceed the manufacturer specified maximum, typically around 85 degrees Celsius for industrial grade components. Passive cooling measures such as thermal vias connecting to a copper pour area on the PCB, combined with small aluminum heatsinks attached to the top of the package, can reduce junction temperatures by 15 to 20 degrees Celsius under continuous full load operation.

For applications involving wireless transmission at maximum power, the instantaneous current draw can exceed 300 milliamperes for short bursts. Your power supply design must accommodate these transient demands without significant voltage droop. Adding a supercapacitor or a small lithium polymer backup battery to the power rail provides temporary energy storage that smooths out these current spikes and prevents unwanted system resets during critical data transmission windows.

## Real World Edge Computing Applications

The ${name} excels in several key edge computing scenarios that demand a balance of processing power, peripheral integration, and energy efficiency. Environmental monitoring stations benefit from the module's ability to interface with a wide variety of analog and digital sensors while maintaining ultra low power sleep modes that extend battery life to months or even years. Agricultural IoT deployments leverage the ${name} to aggregate soil moisture readings, weather station data, and irrigation controller commands across vast rural areas using LoRaWAN or NB IoT wireless protocols.

In industrial automation, the ${name} serves as a capable programmable logic controller replacement for moderate complexity tasks. Its real time processing capabilities, combined with support for industrial communication protocols such as Modbus RTU and CAN bus, allow it to interface directly with motor drives, temperature controllers, and safety interlock systems. The availability of hardware PWM channels with precise timer synchronization makes it particularly well suited for multiphase motor control applications where timing accuracy directly impacts system efficiency and reliability.

Smart building systems represent another growth area for the ${name} platform. From occupancy detection and HVAC optimization to lighting control and access management, the module can serve as the central intelligence node for an entire building automation network. Its onboard wireless capabilities eliminate the need for expensive structured cabling in retrofit installations, while its robust security features protect against unauthorized access to critical building infrastructure systems.

## Reference Firmware Test Harness

For developers utilizing PlatformIO or standard Arduino development environments, compiling a basic telemetry harness verifies physical bus communication before deploying complex firmware code:

\`\`\`cpp
// PinoutHQ Automated C++ Test Harness
#include <Arduino.h>
#include <Wire.h>

#define STATUS_LED_PIN 2
#define TEMP_SENSOR_ADDR 0x48
#define I2C_CLOCK_SPEED 100000

void setup() {
  Serial.begin(115200);
  while (!Serial) { delay(10); }
  Serial.println("PinoutHQ System: Initializing hardware communication...");
  pinMode(STATUS_LED_PIN, OUTPUT);
  Wire.begin();
  Wire.setClock(I2C_CLOCK_SPEED);
  delay(500);
}

void loop() {
  digitalWrite(STATUS_LED_PIN, HIGH);
  Wire.beginTransmission(TEMP_SENSOR_ADDR);
  Wire.write(0x00);
  Wire.endTransmission();
  Wire.requestFrom(TEMP_SENSOR_ADDR, 2);
  if (Wire.available() >= 2) {
    int16_t rawTemp = Wire.read() << 8 | Wire.read();
    float temperature = rawTemp * 0.0625;
    Serial.print("Temperature: ");
    Serial.print(temperature, 2);
    Serial.println(" C");
  }
  delay(100);
  digitalWrite(STATUS_LED_PIN, LOW);
  delay(1900);
}
\`\`\`

This test harness initializes the I2C bus, reads temperature data from a standard sensor, and toggles the status LED to confirm basic IO functionality. Extending this framework to include wireless communication tests, analog sensor readings, and PWM output verification provides comprehensive hardware validation before committing to full scale firmware development.

## Frequently Asked Questions

1. What is the primary operating voltage of the ${name}?
This module is engineered primarily for standard low voltage logic operation, typically accepting input voltages in the range of 3.0 to 5.5 volts DC depending on the specific variant. Connecting high voltage signals directly to the interface header without bidirectional logic level shifters will permanently damage the internal silicon gate oxides. Always consult the official datasheet for the exact voltage tolerances of your specific model revision.

2. Can I integrate this component into commercial hardware products?
Yes, thanks to its wide operating temperature range and dependable signal integrity, this hardware is widely deployed in commercial telemetry gateways, industrial monitoring sensors, and smart home automation equipment. Many manufacturers have successfully passed FCC and CE certification testing using this module as the core controller, thanks to its inherently low electromagnetic emission profile and robust immunity to external radio frequency interference.

3. How do I prevent communication lockups during intensive data transmission?
Ensure your external power supply can deliver continuous clean current during peak transmission bursts, and verify that appropriate pull up resistors are securely installed on all active clock and data bus lines. Implementing a watchdog timer in your firmware that resets the module if the main loop stops executing for more than a few seconds provides an additional safety net against unforeseen software crashes. Many experienced developers also add periodic bus health checks that reconfigure the peripheral interfaces if communication errors exceed a configurable threshold.

4. Is this hardware compatible with standard C++ development environments?
Absolutely. The module is fully supported across standard PlatformIO and Arduino development frameworks, allowing engineers to leverage existing hardware abstraction layer drivers and open source libraries. The manufacturer provides comprehensive board support packages that include peripheral driver examples, middleware stacks for common wireless protocols, and application level reference implementations for typical use cases.

5. How does the thermal performance hold up inside sealed enclosures?
The silicon architecture is optimized for low idle power consumption, typically drawing under 50 microamperes in deep sleep mode. However, if deployed inside sealed weatherproof enclosures under high processing loads, attaching a small passive aluminum heatsink is recommended to prevent thermal throttling. For continuous operation at maximum clock speed in ambient temperatures above 60 degrees Celsius, active cooling through a miniature fan may be necessary to maintain reliable long term performance.

6. Where should I source authentic units to avoid counterfeit components?
Counterfeit hardware modules with inferior flash memory chips, substandard voltage regulators, and missing electrostatic discharge protection are increasingly common on open marketplaces. We strongly recommend purchasing inventory directly through our verified vendor routing feed above to guarantee authentic distribution stock. Genuine units feature laser etched markings with consistent font alignment, uniform solder mask application, and factory sealed antistatic packaging with holographic authenticity labels.`,
    tags: [name, "Hardware Review", "Embedded Systems", "Pinout Guide"]
  };
}

export const scrapeAndSaveComponent = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = ScrapeVendorInputSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ success: false, message: 'Invalid scraping parameters provided', errors: validation.error.format() });
      return;
    }

    const params = validation.data;
    console.log(`⚡ Initializing autonomous scrape for vendor: [${params.vendorName}] at ${params.url}`);
    
    const scrapeResult = await executeVendorScrape(params);
    if (!scrapeResult.success) {
      res.status(502).json({ success: false, message: 'Scraper failed to extract data from vendor website', error: scrapeResult.error });
      return;
    }

    const componentName = scrapeResult.extractedTitle || `Scraped Hardware (${params.vendorName})`;
    const generatedSeoArticle = await generateDynamicArticleAI(componentName, params.vendorName, scrapeResult.rawSpecifications);

    const componentData = {
      name: componentName,
      category: 'Scraped Hardware Module',
      vendor: params.vendorName,
      pinCount: 0,
      specifications: {
        ...scrapeResult.rawSpecifications,
        sourceUrl: params.url,
        scrapedPrice: scrapeResult.price,
        currency: scrapeResult.currency,
        lastScrapedAt: new Date().toISOString(),
        seoArticle: generatedSeoArticle
      },
      inStock: scrapeResult.inStock
    };

    const savedComponent = await Component.findOneAndUpdate(
      { vendor: params.vendorName, name: componentName },
      componentData,
      { new: true, upsert: true }
    );

    console.log(`✅ Successfully synced [${componentName}] with magazine publication to MongoDB Atlas!`);
    res.status(200).json({ success: true, message: 'Scrape and sync complete', data: savedComponent });
  } catch (error: any) {
    console.error('🔥 Fatal error during autonomous scraping pipeline:', error);
    res.status(500).json({ success: false, message: 'Server error during scrape pipeline', error: error.message });
  }
};
