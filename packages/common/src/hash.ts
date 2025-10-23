import * as crypto from 'crypto';

export class HashUtils {
  /**
   * Generate SHA256 hash
   */
  static sha256(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  /**
   * Generate MD5 hash
   */
  static md5(text: string): string {
    return crypto.createHash('md5').update(text).digest('hex');
  }

  /**
   * Generate UUID v4
   */
  static generateId(): string {
    return crypto.randomUUID();
  }

  /**
   * Generate random string
   */
  static generateRandomString(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash object for comparison
   */
  static hashObject(obj: any): string {
    const str = JSON.stringify(obj, Object.keys(obj).sort());
    return this.sha256(str);
  }

  /**
   * SimHash implementation for near-duplicate detection
   */
  static simHash(text: string, hashBits: number = 64): string {
    // Simple SimHash implementation
    const words = text.toLowerCase().split(/\s+/);
    const hashVector = new Array(hashBits).fill(0);
    
    words.forEach(word => {
      const hash = this.sha256(word);
      const binary = this.hexToBinary(hash);
      
      for (let i = 0; i < hashBits; i++) {
        if (binary[i] === '1') {
          hashVector[i]++;
        } else {
          hashVector[i]--;
        }
      }
    });
    
    // Convert to binary string
    let result = '';
    for (let i = 0; i < hashBits; i++) {
      result += hashVector[i] > 0 ? '1' : '0';
    }
    
    return this.binaryToHex(result);
  }

  /**
   * MinHash implementation for similarity
   */
  static minHash(text: string, numHashes: number = 128): string {
    const words = text.toLowerCase().split(/\s+/);
    const shingles = this.getShingles(words, 3);
    const hashes = new Array(numHashes).fill(Infinity);
    
    shingles.forEach(shingle => {
      const hash = this.sha256(shingle);
      for (let i = 0; i < numHashes; i++) {
        const hashValue = this.hashToNumber(hash, i);
        hashes[i] = Math.min(hashes[i], hashValue);
      }
    });
    
    return hashes.join(',');
  }

  /**
   * Calculate Jaccard similarity between two MinHash signatures
   */
  static jaccardSimilarity(hash1: string, hash2: string): number {
    const hashes1 = hash1.split(',').map(Number);
    const hashes2 = hash2.split(',').map(Number);
    
    let matches = 0;
    for (let i = 0; i < hashes1.length; i++) {
      if (hashes1[i] === hashes2[i]) {
        matches++;
      }
    }
    
    return matches / hashes1.length;
  }

  /**
   * Calculate Hamming distance between two SimHash values
   */
  static hammingDistance(hash1: string, hash2: string): number {
    const binary1 = this.hexToBinary(hash1);
    const binary2 = this.hexToBinary(hash2);
    
    let distance = 0;
    for (let i = 0; i < Math.min(binary1.length, binary2.length); i++) {
      if (binary1[i] !== binary2[i]) {
        distance++;
      }
    }
    
    return distance;
  }

  /**
   * Check if two texts are near-duplicates using SimHash
   */
  static isNearDuplicate(text1: string, text2: string, threshold: number = 3): boolean {
    const hash1 = this.simHash(text1);
    const hash2 = this.simHash(text2);
    const distance = this.hammingDistance(hash1, hash2);
    
    return distance <= threshold;
  }

  /**
   * Check if two texts are similar using MinHash
   */
  static isSimilar(text1: string, text2: string, threshold: number = 0.8): boolean {
    const hash1 = this.minHash(text1);
    const hash2 = this.minHash(text2);
    const similarity = this.jaccardSimilarity(hash1, hash2);
    
    return similarity >= threshold;
  }

  /**
   * Generate consistent hash for load balancing
   */
  static consistentHash(key: string, buckets: number): number {
    const hash = this.sha256(key);
    const hashValue = parseInt(hash.substring(0, 8), 16);
    return hashValue % buckets;
  }

  /**
   * Generate hash for cache key
   */
  static cacheKey(prefix: string, ...parts: any[]): string {
    const key = parts.map(part => 
      typeof part === 'object' ? JSON.stringify(part) : String(part)
    ).join(':');
    
    return `${prefix}:${this.sha256(key)}`;
  }

  /**
   * Generate hash for rate limiting
   */
  static rateLimitKey(identifier: string, window: string): string {
    return `rate_limit:${identifier}:${window}`;
  }

  /**
   * Generate hash for session
   */
  static sessionKey(userId: string, sessionId: string): string {
    return `session:${userId}:${sessionId}`;
  }

  /**
   * Generate hash for request
   */
  static requestKey(method: string, path: string, body?: any): string {
    const bodyHash = body ? this.sha256(JSON.stringify(body)) : '';
    return `request:${method}:${path}:${bodyHash}`;
  }

  /**
   * Convert hex to binary
   */
  private static hexToBinary(hex: string): string {
    return hex.split('').map(char => {
      const binary = parseInt(char, 16).toString(2);
      return binary.padStart(4, '0');
    }).join('');
  }

  /**
   * Convert binary to hex
   */
  private static binaryToHex(binary: string): string {
    let hex = '';
    for (let i = 0; i < binary.length; i += 4) {
      const chunk = binary.substr(i, 4);
      hex += parseInt(chunk, 2).toString(16);
    }
    return hex;
  }

  /**
   * Get shingles from words
   */
  private static getShingles(words: string[], size: number): string[] {
    const shingles: string[] = [];
    for (let i = 0; i <= words.length - size; i++) {
      shingles.push(words.slice(i, i + size).join(' '));
    }
    return shingles;
  }

  /**
   * Convert hash to number using different seeds
   */
  private static hashToNumber(hash: string, seed: number): number {
    const hashValue = this.sha256(hash + seed);
    return parseInt(hashValue.substring(0, 8), 16);
  }

  /**
   * Generate hash for file content
   */
  static hashFile(content: Buffer | string): string {
    const data = typeof content === 'string' ? Buffer.from(content) : content;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate hash for stream
   */
  static hashStream(stream: NodeJS.ReadableStream): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      
      stream.on('data', (chunk) => {
        hash.update(chunk);
      });
      
      stream.on('end', () => {
        resolve(hash.digest('hex'));
      });
      
      stream.on('error', reject);
    });
  }

  /**
   * Verify hash
   */
  static verifyHash(data: string, hash: string): boolean {
    return this.sha256(data) === hash;
  }

  /**
   * Generate hash with salt
   */
  static hashWithSalt(data: string, salt: string): string {
    return this.sha256(data + salt);
  }

  /**
   * Generate random salt
   */
  static generateSalt(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}
