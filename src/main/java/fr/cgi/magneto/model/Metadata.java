package fr.cgi.magneto.model;

import fr.cgi.magneto.core.constants.Field;
import io.vertx.core.json.JsonObject;

public class Metadata implements Model {
    private final String name;
    private final String filename;
    private final String contentType;
    private final String contentTransferEncoding;
    private final String charset;
    private final int size;

    public Metadata(JsonObject metadata) {
        this.name = metadata.getString(Field.NAME);
        this.filename = metadata.getString(Field.FILENAME);
        this.contentType = metadata.getString(Field.CONTENT_TYPE);
        this.contentTransferEncoding = metadata.getString(Field.CONTENT_TRANSFER_ENCODING);
        this.charset = metadata.getString(Field.CHARSET);
        this.size = metadata.getInteger(Field.SIZE);
    }

    public String getName() {
        return name;
    }

    public String getFilename() {
        return filename;
    }

    public String getContentType() {
        return contentType;
    }

    public String getContentTransferEncoding() {
        return contentTransferEncoding;
    }

    public String getCharset() {
        return charset;
    }


    public int getSize() {
        return size;
    }


    @Override
    public JsonObject toJson() {
        return new JsonObject()
                .put(Field.NAME, this.getName())
                .put(Field.FILENAME, this.getFilename())
                .put(Field.CONTENT_TYPE, this.getContentType())
                .put(Field.CONTENT_TRANSFER_ENCODING, this.getContentTransferEncoding())
                .put(Field.CHARSET, this.getCharset())
                .put(Field.SIZE, this.getSize());
    }

    @Override
    public Metadata model(JsonObject metadata) {
        return new Metadata(metadata);
    }

}
