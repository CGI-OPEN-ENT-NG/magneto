package fr.cgi.magneto.model;

import io.vertx.core.json.*;
import io.vertx.ext.unit.*;
import io.vertx.ext.unit.junit.*;
import org.junit.*;
import org.junit.runner.*;

@RunWith(VertxUnitRunner.class)
public class FolderPayloadTest {

    JsonObject folderJsonObject_1 = new JsonObject()
            .put("title", "title")
            .put("parentId", "parentId")
            .put("ownerId", "ownerId");

    @Test
    public void testFolderPayloadHasBeenInstantiated(TestContext ctx) {
        FolderPayload folder = new FolderPayload(folderJsonObject_1);
        ctx.assertEquals(folderJsonObject_1, folder.toJson());
    }

    @Test
    public void testFolderPayloadHasContentWithObject(TestContext ctx) {
        FolderPayload folder = new FolderPayload(folderJsonObject_1);
        boolean isNotEmpty =
                !folder.getTitle().isEmpty() &&
                !folder.getParentId().isEmpty() &&
                !folder.getOwnerId().isEmpty();
        ctx.assertTrue(isNotEmpty);
    }

}
