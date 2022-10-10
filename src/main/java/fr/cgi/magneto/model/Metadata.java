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
                .put(Field.TITLE, this.getName())
                .put(Field.RESOURCETYPE, this.getFilename())
                .put(Field.RESOURCEID, this.getContentType())
                .put(Field.DESCRIPTION, this.getContentTransferEncoding())
                .put(Field.CAPTION, this.getCharset())
                .put(Field.MODIFICATIONDATE, this.getSize());
    }

    @Override
    public Metadata model(JsonObject metadata) {
        return new Metadata(metadata);
    }

}
