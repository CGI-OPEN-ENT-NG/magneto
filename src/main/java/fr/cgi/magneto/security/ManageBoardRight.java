package fr.cgi.magneto.security;

import fr.cgi.magneto.core.constants.*;
import fr.cgi.magneto.helper.*;
import fr.wseduc.webutils.http.*;
import io.vertx.core.*;
import io.vertx.core.http.*;
import io.vertx.core.json.*;
import org.entcore.common.http.filter.*;
import org.entcore.common.user.*;

public class ManageBoardRight implements ResourcesProvider {
    @Override
    public void authorize(HttpServerRequest request, Binding binding, UserInfos user,
                          Handler<Boolean> handler) {

        String boardId = request.getParam(Field.ID);
        JsonObject query = new JsonObject()
                .put(Field._ID, boardId)
                .put(Field.DELETED, false)
                .put(Mongo.OR,
                        new JsonArray()
                                .add(new JsonObject()
                                        .put(Field.OWNERID, user.getUserId()))
                                .add(new JsonObject()
                                        .put(String.format("%s.%s", Field.SHARED, Field.USERID),
                                                new JsonObject().put(Mongo.IN, new JsonArray().add(user.getUserId())))
                                        .put(String.format("%s.%s", Field.SHARED, "fr-cgi-magneto-controller-ShareBoardController|initManagerRight"), true))
                                .add(new JsonObject()
                                        .put(String.format("%s.%s", Field.SHARED, Field.GROUPID),
                                                new JsonObject().put(Mongo.IN, user.getGroupsIds()))
                                        .put(String.format("%s.%s", Field.SHARED, "fr-cgi-magneto-controller-ShareBoardController|initManagerRight"), true))
                );

       MongoAppFilter.executeCountQuery(request, CollectionsConstant.BOARD_COLLECTION, query, 1, res -> {
           handler.handle(Boolean.TRUE.equals(res) && WorkflowHelper.hasRight(user, Rights.MANAGE_BOARD));
       });
    }
}
