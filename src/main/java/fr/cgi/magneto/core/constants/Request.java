package fr.cgi.magneto.core.constants;

public class Request {
    public static final String ALL = "all";
    public static final String OFFSET = "offset";
    public static final String LIMIT = "limit";
    public static final String QUERY = "query";
    public static final String PAGESIZE = "pageSize";
    public static final String MESSAGE = "message";
    public static final String OK = "ok";
    public static final String STATUS = "status";
    public static final String RESULT = "result";
    public static final String RESULTS = "results";

    private Request() {
        throw new IllegalStateException("Utility class");
    }
}
