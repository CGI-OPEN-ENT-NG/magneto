package fr.cgi.magneto.security;

import fr.cgi.magneto.core.constants.CollectionsConstant;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Mongo;
import fr.cgi.magneto.core.constants.Rights;
import fr.cgi.magneto.helper.WorkflowHelper;
import fr.wseduc.webutils.http.Binding;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.http.filter.MongoAppFilter;
import org.entcore.common.http.filter.ResourcesProvider;
import org.entcore.common.user.UserInfos;

public class DuplicateBoardRight implements ResourcesProvider {
    @Override
    public void authorize(HttpServerRequest request, Binding binding, UserInfos user,
                          Handler<Boolean> handler) {

        String boardId = request.getParam(Field.BOARDID);
        JsonObject query = getDuplicateRightQuery(user, boardId);

        MongoAppFilter.executeCountQuery(request, CollectionsConstant.BOARD_COLLECTION, query, 1, res -> {
            handler.handle(Boolean.TRUE.equals(res) && WorkflowHelper.hasRight(user, Rights.MANAGE_BOARD));
        });
    }

    private static JsonObject getDuplicateRightQuery(UserInfos user, String boardId) {
        return new JsonObject()
                .put(Field._ID, boardId)
                .put(Field.DELETED, false)
                .put(Mongo.OR,
                        new JsonArray()
                                .add(new JsonObject()
                                        .put(Field.OWNERID, user.getUserId()))
                                .add(new JsonObject()
                                        .put(Field.PUBLIC, true))
                                .add(new JsonObject()
                                        .put(String.format("%s.%s", Field.SHARED, Field.USERID),
                                                new JsonObject().put(Mongo.IN, new JsonArray().add(user.getUserId())))
                                        .put(String.format("%s.%s", Field.SHARED, "fr-cgi-magneto-controller-ShareBoardController|initContribRight"), true))
                                .add(new JsonObject()
                                        .put(String.format("%s.%s", Field.SHARED, Field.GROUPID),
                                                new JsonObject().put(Mongo.IN, user.getGroupsIds()))
                                        .put(String.format("%s.%s", Field.SHARED, "fr-cgi-magneto-controller-ShareBoardController|initContribRight"), true)));
    }
}
