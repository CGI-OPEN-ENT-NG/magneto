package fr.cgi.magneto.helper;

import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class DateHelper {

    private static final Logger LOGGER = LoggerFactory.getLogger(DateHelper.class);
    public static final String MONGO_FORMAT = "yyyy-MM-dd HH:mm:ss";


    private DateHelper() {
    }

    public static String getDateString(Date date, String format) {
        SimpleDateFormat sdf = new SimpleDateFormat(format);
        return sdf.format(date);
    }

    public static Date parseDate(String dateString) {
        Date date = new Date();
        SimpleDateFormat msdf = DateHelper.getMongoSimpleDateFormat();
        try {
            date = msdf.parse(dateString);
        } catch (ParseException e) {
            LOGGER.error("[Magneto@DateHelper::parseDate] Error when casting date: ", e);
        }

        return date;
    }

    public static Date parse(String date) throws ParseException {
        SimpleDateFormat msdf = DateHelper.getMongoSimpleDateFormat();
        return msdf.parse(date);
    }

    public static Date parse(String date, String format) throws ParseException {
        SimpleDateFormat sdf = new SimpleDateFormat(format);
        return sdf.parse(date);
    }

    public static Date parseDate(String dateString, String format) {
        Date date = new Date();

        SimpleDateFormat sdf = new SimpleDateFormat(format);
        try {
            date = sdf.parse(dateString);
        } catch (ParseException e) {
            LOGGER.error("[Magneto@DateHelper::parseDate] Error when casting date: ", e);
        }

        return date;
    }

    public static SimpleDateFormat getMongoSimpleDateFormat() {
        return new SimpleDateFormat(MONGO_FORMAT);
    }


}
