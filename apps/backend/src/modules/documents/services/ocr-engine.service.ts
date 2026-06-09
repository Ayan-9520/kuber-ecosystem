import {
  AADHAAR_REGEX,
  GST_REGEX,
  PAN_REGEX,
  VEHICLE_REGEX,
} from '../constants/documents.constants.js';
import type { OcrExtraction } from '../types/documents.types.js';

function extractPan(text: string): string | undefined {
  const match = text.toUpperCase().match(PAN_REGEX);
  return match?.[0];
}

function extractAadhaar(text: string): string | undefined {
  const match = text.match(AADHAAR_REGEX);
  return match?.[0]?.replace(/\s/g, '');
}

function extractGst(text: string): string | undefined {
  const match = text.toUpperCase().match(GST_REGEX);
  return match?.[0];
}

function extractVehicle(text: string): string | undefined {
  const match = text.toUpperCase().match(VEHICLE_REGEX);
  return match?.[0];
}

function extractName(text: string): string | undefined {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  return lines.find((l) => l.length > 3 && /^[A-Za-z\s.]+$/.test(l));
}

export const ocrEngineService = {
  process(documentTypeCode: string, rawText: string): OcrExtraction {
    const text = rawText || '';
    const extractedFields: Record<string, unknown> = { rawTextLength: text.length };
    let confidence = 55;

    const pan = extractPan(text);
    const aadhaar = extractAadhaar(text);
    const gst = extractGst(text);
    const vehicle = extractVehicle(text);
    const name = extractName(text);

    if (pan) {
      extractedFields.pan = pan;
      confidence += 15;
    }
    if (aadhaar) {
      extractedFields.aadhaar = aadhaar;
      confidence += 15;
    }
    if (gst) {
      extractedFields.gst = gst;
      confidence += 10;
    }
    if (vehicle) {
      extractedFields.vehicle = vehicle;
      confidence += 10;
    }
    if (name) {
      extractedFields.name = name;
      confidence += 5;
    }

    const upperCode = documentTypeCode.toUpperCase();
    if (upperCode.includes('PAN') && pan) confidence += 10;
    if (upperCode.includes('AADHAAR') && aadhaar) confidence += 10;
    if (upperCode.includes('GST') && gst) confidence += 10;
    if (upperCode.includes('VEHICLE') && vehicle) confidence += 10;

    let propertyDetails: Record<string, unknown> | undefined;
    if (upperCode.includes('PROPERTY')) {
      propertyDetails = {
        summary: text.slice(0, 500),
        detectedKeywords: ['property', 'survey', 'plot'].filter((k) => text.toLowerCase().includes(k)),
      };
      confidence += 5;
    }

    return {
      extractedName: name,
      panNumber: pan,
      aadhaarNumber: aadhaar,
      gstNumber: gst,
      vehicleNumber: vehicle,
      propertyDetails,
      address: text.includes('Address') ? text.split('Address')[1]?.slice(0, 200)?.trim() : undefined,
      confidenceScore: Math.min(100, confidence),
      extractedFields,
    };
  },

  async extractFromBuffer(documentTypeCode: string, buffer: Buffer): Promise<OcrExtraction> {
    const text = buffer.toString('utf8').slice(0, 50000);
    return ocrEngineService.process(documentTypeCode, text);
  },
};
