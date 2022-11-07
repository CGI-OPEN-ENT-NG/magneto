package fr.cgi.magneto.model;

import io.vertx.core.json.*;
import io.vertx.ext.unit.*;
import io.vertx.ext.unit.junit.*;
import org.junit.*;
import org.junit.runner.*;

@RunWith(VertxUnitRunner.class)
public class MetadataTest {

    JsonObject metadataJsonObject = new JsonObject()
            .put("name", "name")
            .put("filename", "filename")
            .put("content-type", "contentType")
            .put("content-transfer-encoding", "contentTransferEncoding")
            .put("charset", "charset")
            .put("size", 1);


    @Test
    public void testMetadataHasBeenInstantiated(TestContext ctx) {
        Metadata metadata = new Metadata(metadataJsonObject);
        ctx.assertEquals(metadataJsonObject,metadata.toJson());
    }

    @Test
    public void testMetadataHasContentWithObject(TestContext ctx) {
        Metadata metadata = new Metadata(metadataJsonObject);
        boolean isNotEmpty =
                !metadata.getName().isEmpty() &&
                !metadata.getFilename().isEmpty() &&
                !metadata.getContentType().isEmpty() &&
                !metadata.getContentTransferEncoding().isEmpty() &&
                !metadata.getCharset().isEmpty() &&
                metadata.getSize() != 0;
        ctx.assertTrue(isNotEmpty);
    }
}