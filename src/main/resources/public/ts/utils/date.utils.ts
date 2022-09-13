import {moment} from 'entcore';

export class DateUtils {
    static FORMAT = {
        'YEAR-MONTH-DAY-HOUR-MIN-SEC': 'YYYY-MM-DD HH:mm:ss',
        'YEAR/MONTH/DAY-HOUR-MIN-SEC': 'YYYY/MM/DD HH:mm:ss',
        'YEAR/MONTH/DAY-HOUR-MIN': 'YYYY/MM/DD HH:mm',
        'YEAR-MONTH-DAY-T-HOUR-MIN-SEC': 'YYYY-MM-DDTHH:mm:ss',
        'YEAR-MONTH-DAY': 'YYYY-MM-DD',
        'YEARMONTHDAY': 'YYYYMMDD',
        'YEAR-MONTH': 'YYYY-MM',
        'DAY-MONTH-YEAR': 'DD/MM/YYYY',
        'DAY-MONTH': 'DD/MM', // e.g "04/11"
        'HOUR-MINUTES': 'kk:mm', // e.g "09:00"
        'BIRTHDATE': 'L',
        'SHORT-MONTH': 'MMM', // e.g "Jan"
        'MONTH': 'MMMM', // e.g "January"
        'DAY-MONTH-YEAR-LETTER': 'LL',  // e.g "9 juin 2019"
        'DAY-DATE': 'dddd L',
        'DATE-FULL-LETTER': 'dddd LL',
        'DAY-MONTH-HALFYEAR': 'DD/MM/YY',
        'DAY-MONTH-HALFYEAR-HOUR-MIN': 'DD/MM/YY HH:mm',
        'HOUR-MIN-SEC': 'HH:mm:ss',
        'HOUR-MIN': 'HH:mm',
        'MINUTES': 'mm'
    };

    static START_DAY_TIME = "00:00:00";
    static END_DAY_TIME = "23:59:59";
    /**
     * Format date based on given format using moment
     * @param date date to format
     * @param format format
     */
    static format(date: any, format: string) {
        return moment(date).format(format);
    }
}