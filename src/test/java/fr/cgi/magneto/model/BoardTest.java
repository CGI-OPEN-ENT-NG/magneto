package fr.cgi.magneto.model;

import io.vertx.core.json.*;
import io.vertx.ext.unit.*;
import io.vertx.ext.unit.junit.*;
import org.junit.*;
import org.junit.runner.*;

import java.util.*;

@RunWith(VertxUnitRunner.class)
public class BoardTest {

    JsonObject boardJsonObject_1 = new JsonObject()
            .put("_id", "id")
            .put("title", "title")
            .put("imageUrl", "imageUrl")
            .put("description", "description")
            .put("ownerId", "ownerId")
            .put("ownerName", "ownerName")
            .put("cardIds", new JsonArray(Arrays.asList("cardId1", "cardId2")))
            .put("creationDate", "creationDate")
            .put("modificationDate", "modificationDate")
            .put("deleted", true)
            .put("public", true)
            .put("folderId", "folderId");


    @Test
    public void testBoardHasBeenInstantiated(TestContext ctx) {
        Board board = new Board(boardJsonObject_1);
        board.setModificationDate("modificationDate");
        board.setCreationDate("creationDate");
        ctx.assertEquals(boardJsonObject_1, board.toJson());
    }

    @Test
    public void testBoardHasContentWithObject(TestContext ctx) {
        Board board = new Board(boardJsonObject_1);
        boolean isNotEmpty = !board.getId().isEmpty() &&
                !board.getTitle().isEmpty() &&
                !board.getImageUrl().isEmpty() &&
                !board.getDescription().isEmpty() &&
                !board.getOwnerId().isEmpty() &&
                !board.getOwnerName().isEmpty() &&
                !board.getCardIds().isEmpty() &&
                !board.getCreationDate().isEmpty() &&
                !board.getModificationDate().isEmpty() &&
                board.isDeleted() &&
                board.isPublic() &&
                !board.getFolderId().isEmpty();
        ctx.assertTrue(isNotEmpty);
    }
}
