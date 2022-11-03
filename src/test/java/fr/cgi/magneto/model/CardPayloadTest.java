package fr.cgi.magneto.model;

import fr.cgi.magneto.model.cards.CardPayload;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(VertxUnitRunner.class)
public class CardPayloadTest {

    String n = null;

    JsonObject cardCreateJsonObject_1 = new JsonObject()
            .put("title", "title")
            .put("resourceId", "resourceId")
            .put("resourceType", "resourceType")
            .put("resourceUrl", "resourceUrl")
            .put("caption", "caption")
            .put("description", "description")
            .put("ownerId", "ownerId")
            .put("ownerName", "ownerName")
            .put("lastModifierId", n)
            .put("lastModifierName", n)
            .put("creationDate", "creationDate")
            .put("modificationDate", "modificationDate")
            .put("parentId", "parentId")
            .put("boardId", "boardId");

    JsonObject cardUpdateJsonObject_1 = new JsonObject()
            .put("title", "title")
            .put("resourceId", "resourceId")
            .put("resourceType", "resourceType")
            .put("resourceUrl", "resourceUrl")
            .put("caption", "caption")
            .put("boardId", n)
            .put("description", "description")
            .put("lastModifierId", "lastModifierId")
            .put("lastModifierName", "lastModifierName")
            .put("modificationDate", "modificationDate");

    @Test
    public void testCardPayloadHasBeenInstantiated(TestContext ctx) {
        CardPayload card = new CardPayload(cardCreateJsonObject_1);
        card.setModificationDate("modificationDate");
        card.setCreationDate("creationDate");
        ctx.assertEquals(cardCreateJsonObject_1, card.toJson());

        CardPayload card2 = new CardPayload(cardUpdateJsonObject_1);
        card2.setId("id")
                .setModificationDate("modificationDate")
                .setLastModifierId("lastModifierId")
                .setLastModifierName("lastModifierName");
        ctx.assertEquals(cardUpdateJsonObject_1, card2.toJson());

    }

    @Test
    public void testCardPayloadHasContentWithObject(TestContext ctx) {
        CardPayload card = new CardPayload(cardCreateJsonObject_1);
        boolean isNotEmpty =
                !card.getTitle().isEmpty() &&
                !card.getResourceId().isEmpty() &&
                !card.getResourceType().isEmpty() &&
                !card.getResourceUrl().isEmpty() &&
                !card.getDescription().isEmpty() &&
                !card.getCaption().isEmpty() &&
                !card.getOwnerId().isEmpty() &&
                !card.getOwnerName().isEmpty() &&
                !card.getCreationDate().isEmpty() &&
                !card.getModificationDate().isEmpty() &&
                !card.getParentId().isEmpty() &&
                !card.getBoardId().isEmpty();
        ctx.assertTrue(isNotEmpty);
    }
}
