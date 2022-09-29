package fr.cgi.magneto.model;

import fr.cgi.magneto.model.boards.BoardPayload;
import io.vertx.core.json.*;
import io.vertx.ext.unit.*;
import io.vertx.ext.unit.junit.*;
import org.junit.*;
import org.junit.runner.*;

@RunWith(VertxUnitRunner.class)
public class BoardPayloadTest {

    JsonObject boardCreateJsonObject_1 = new JsonObject()
            .put("title", "title")
            .put("imageUrl", "imageUrl")
            .put("description", "description")
            .put("ownerId", "ownerId")
            .put("ownerName", "ownerName")
            .put("creationDate", "creationDate")
            .put("modificationDate", "modificationDate")
            .put("deleted", false)
            .put("public", false)
            .put("folderId", "folderId")
            .put("cardIds", new JsonArray());

    JsonObject boardUpdateJsonObject_1 = new JsonObject()
            .put("title", "title")
            .put("imageUrl", "imageUrl")
            .put("description", "description")
            .put("modificationDate", "modificationDate")
            .put("cardIds", new JsonArray());

    @Test
    public void testBoardPayloadHasBeenInstantiated(TestContext ctx) {
        BoardPayload board = new BoardPayload(boardCreateJsonObject_1);
        board.setModificationDate("modificationDate");
        board.setCreationDate("creationDate");
        ctx.assertEquals(boardCreateJsonObject_1, board.toJson());

        BoardPayload board2 = new BoardPayload(boardUpdateJsonObject_1);
        board2.setId("id").setModificationDate("modificationDate");
        ctx.assertEquals(boardUpdateJsonObject_1, board2.toJson());

    }

    @Test
    public void testBoardPayloadHasContentWithObject(TestContext ctx) {
        BoardPayload board = new BoardPayload(boardCreateJsonObject_1);
        boolean isNotEmpty =
                !board.getTitle().isEmpty() &&
                !board.getImageUrl().isEmpty() &&
                !board.getDescription().isEmpty() &&
                !board.getOwnerId().isEmpty() &&
                !board.getOwnerName().isEmpty() &&
                !board.getCreationDate().isEmpty() &&
                !board.getModificationDate().isEmpty() &&
                !board.getFolderId().isEmpty();
        ctx.assertTrue(isNotEmpty);
    }
}
