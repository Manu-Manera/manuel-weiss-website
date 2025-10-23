export class TimeUtils {
  static readonly TIMEZONE = 'Europe/Zurich';
  static readonly UTC_OFFSET = 1; // UTC+1 (CET) or UTC+2 (CEST)

  /**
   * Get current timestamp
   */
  static now(): Date {
    return new Date();
  }

  /**
   * Convert date to Zurich timezone
   */
  static toZurich(date: Date): Date {
    return new Date(date.toLocaleString('en-US', { timeZone: this.TIMEZONE }));
  }

  /**
   * Convert date to UTC
   */
  static toUTC(date: Date): Date {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  }

  /**
   * Format date for display in Zurich timezone
   */
  static formatForDisplay(date: Date): string {
    return date.toLocaleString('de-DE', { 
      timeZone: this.TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  /**
   * Format date for API responses
   */
  static formatForAPI(date: Date): string {
    return date.toISOString();
  }

  /**
   * Parse date from API
   */
  static parseFromAPI(dateString: string): Date {
    return new Date(dateString);
  }

  /**
   * Get business days between two dates
   */
  static getBusinessDays(start: Date, end: Date): number {
    let count = 0;
    const current = new Date(start);
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  }

  /**
   * Check if market is open (simplified - European markets)
   */
  static isMarketOpen(date: Date = new Date()): boolean {
    const zurichTime = this.toZurich(date);
    const dayOfWeek = zurichTime.getDay();
    const hour = zurichTime.getHours();
    const minute = zurichTime.getMinutes();
    const timeInMinutes = hour * 60 + minute;

    // Market is closed on weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return false;
    }

    // Market hours: 9:00 - 17:30 CET/CEST
    const marketOpen = 9 * 60; // 9:00 AM
    const marketClose = 17 * 60 + 30; // 5:30 PM

    return timeInMinutes >= marketOpen && timeInMinutes <= marketClose;
  }

  /**
   * Get next market open time
   */
  static getNextMarketOpen(date: Date = new Date()): Date {
    const zurichTime = this.toZurich(date);
    const nextOpen = new Date(zurichTime);
    
    // Set to 9:00 AM
    nextOpen.setHours(9, 0, 0, 0);
    
    // If it's already past 9:00 AM today, move to next business day
    if (zurichTime.getHours() >= 9) {
      nextOpen.setDate(nextOpen.getDate() + 1);
    }
    
    // Skip weekends
    while (nextOpen.getDay() === 0 || nextOpen.getDay() === 6) {
      nextOpen.setDate(nextOpen.getDate() + 1);
    }
    
    return nextOpen;
  }

  /**
   * Get time until next market open
   */
  static getTimeUntilMarketOpen(date: Date = new Date()): number {
    const nextOpen = this.getNextMarketOpen(date);
    return nextOpen.getTime() - date.getTime();
  }

  /**
   * Check if it's a business day
   */
  static isBusinessDay(date: Date = new Date()): boolean {
    const zurichTime = this.toZurich(date);
    const dayOfWeek = zurichTime.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6;
  }

  /**
   * Get start of day in Zurich timezone
   */
  static getStartOfDay(date: Date = new Date()): Date {
    const zurichTime = this.toZurich(date);
    const startOfDay = new Date(zurichTime);
    startOfDay.setHours(0, 0, 0, 0);
    return startOfDay;
  }

  /**
   * Get end of day in Zurich timezone
   */
  static getEndOfDay(date: Date = new Date()): Date {
    const zurichTime = this.toZurich(date);
    const endOfDay = new Date(zurichTime);
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay;
  }

  /**
   * Get start of week (Monday) in Zurich timezone
   */
  static getStartOfWeek(date: Date = new Date()): Date {
    const zurichTime = this.toZurich(date);
    const startOfWeek = new Date(zurichTime);
    const dayOfWeek = startOfWeek.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(startOfWeek.getDate() - daysToMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  }

  /**
   * Get start of month in Zurich timezone
   */
  static getStartOfMonth(date: Date = new Date()): Date {
    const zurichTime = this.toZurich(date);
    const startOfMonth = new Date(zurichTime);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    return startOfMonth;
  }

  /**
   * Get start of year in Zurich timezone
   */
  static getStartOfYear(date: Date = new Date()): Date {
    const zurichTime = this.toZurich(date);
    const startOfYear = new Date(zurichTime);
    startOfYear.setMonth(0, 1);
    startOfYear.setHours(0, 0, 0, 0);
    return startOfYear;
  }

  /**
   * Add business days to a date
   */
  static addBusinessDays(date: Date, days: number): Date {
    const result = new Date(date);
    let addedDays = 0;
    
    while (addedDays < days) {
      result.setDate(result.getDate() + 1);
      if (this.isBusinessDay(result)) {
        addedDays++;
      }
    }
    
    return result;
  }

  /**
   * Get timezone offset in minutes
   */
  static getTimezoneOffset(date: Date = new Date()): number {
    const zurichTime = this.toZurich(date);
    return zurichTime.getTimezoneOffset();
  }

  /**
   * Check if date is in DST (Daylight Saving Time)
   */
  static isDST(date: Date = new Date()): boolean {
    const zurichTime = this.toZurich(date);
    const january = new Date(zurichTime.getFullYear(), 0, 1);
    const july = new Date(zurichTime.getFullYear(), 6, 1);
    const januaryOffset = january.getTimezoneOffset();
    const julyOffset = july.getTimezoneOffset();
    const currentOffset = zurichTime.getTimezoneOffset();
    
    return currentOffset !== Math.max(januaryOffset, julyOffset);
  }

  /**
   * Get timezone abbreviation
   */
  static getTimezoneAbbreviation(date: Date = new Date()): string {
    return this.isDST(date) ? 'CEST' : 'CET';
  }

  /**
   * Format duration in human readable format
   */
  static formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Get age of a date in human readable format
   */
  static getAge(date: Date): string {
    const now = this.now();
    const diff = now.getTime() - date.getTime();
    return this.formatDuration(diff);
  }

  /**
   * Check if date is today
   */
  static isToday(date: Date): boolean {
    const today = this.getStartOfDay();
    const dateStart = this.getStartOfDay(date);
    return today.getTime() === dateStart.getTime();
  }

  /**
   * Check if date is yesterday
   */
  static isYesterday(date: Date): boolean {
    const yesterday = new Date(this.getStartOfDay());
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStart = this.getStartOfDay(date);
    return yesterday.getTime() === dateStart.getTime();
  }

  /**
   * Check if date is this week
   */
  static isThisWeek(date: Date): boolean {
    const thisWeekStart = this.getStartOfWeek();
    const dateStart = this.getStartOfDay(date);
    return dateStart >= thisWeekStart;
  }

  /**
   * Check if date is this month
   */
  static isThisMonth(date: Date): boolean {
    const thisMonthStart = this.getStartOfMonth();
    const dateStart = this.getStartOfDay(date);
    return dateStart >= thisMonthStart;
  }

  /**
   * Check if date is this year
   */
  static isThisYear(date: Date): boolean {
    const thisYearStart = this.getStartOfYear();
    const dateStart = this.getStartOfDay(date);
    return dateStart >= thisYearStart;
  }
}
