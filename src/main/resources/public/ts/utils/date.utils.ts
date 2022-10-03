import {moment} from 'entcore';
import {DAYS, HOURS, MINUTES, SECONDS} from "../core/constants/date-format.const";
import {I18nUtils} from "./i18n.utils";
import {Moment} from "moment/moment";

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
        'DAY-MONTH-HALFYEAR-HOUR-MIN-SEC': 'DD/MM/YY HH:mm:ss',
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
    static format(date: any, format: string): string {
        return moment(date).format(format);
    }

    /**
     * Format date based on given format using moment
     * @param date date to format
     * @param format format
     */
    static createdSince(date: string, format: string): string {
        let now: Moment = moment();
        let formatDate: Moment = moment(date);
        let resultDate: string = "";
        if (this.moreThan(formatDate, DAYS)) {
            if (now.diff(formatDate, DAYS) == 1) {
                resultDate = I18nUtils.translate("magneto.card.time.yesterday")
            } else {
                resultDate = formatDate.format(format);
            }
        } else if (this.moreThan(formatDate, HOURS)) {
            resultDate = I18nUtils.getWithParams("magneto.card.time.hours", [now.diff(formatDate, HOURS).toString()]);
        } else if (this.moreThan(formatDate, MINUTES)) {
            resultDate = I18nUtils.getWithParams("magneto.card.time.minutes", [now.diff(formatDate, MINUTES).toString()]);
        } else if (this.moreThan(formatDate, SECONDS)) {
            resultDate = I18nUtils.getWithParams("magneto.card.time.seconds", [now.diff(formatDate, SECONDS).toString()]);
        }
        return resultDate;
    }

    private static moreThan(date: any, format: string): boolean {
        return moment().diff(moment(date), format) > 0;
    }

}