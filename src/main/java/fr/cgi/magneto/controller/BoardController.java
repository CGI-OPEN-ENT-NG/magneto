package fr.cgi.magneto.controller;

import fr.cgi.magneto.core.constants.*;
import fr.cgi.magneto.model.*;
import fr.cgi.magneto.security.*;
import fr.cgi.magneto.service.BoardService;
import fr.cgi.magneto.service.ServiceFactory;
import fr.wseduc.rs.*;
import fr.wseduc.security.*;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.http.*;
import org.entcore.common.controller.*;
import org.entcore.common.http.filter.*;
import org.entcore.common.user.UserUtils;

import java.util.*;

public class BoardController extends ControllerHelper {

    private final BoardService boardService;

    public BoardController(ServiceFactory serviceFactory) {
        this.boardService = serviceFactory.boardService();
    }

    @Get("/boards")
    @ApiDoc("Get all boards")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void getAllBoards(HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            String searchText = (request.getParam(Field.SEARCHTEXT) != null) ?
                    request.getParam(Field.SEARCHTEXT) : "";
            String folderId = request.getParam(Field.FOLDERID);
            boolean isPublic = Boolean.parseBoolean(request.getParam(Field.ISPUBLIC));
            boolean isShared = Boolean.parseBoolean(request.getParam(Field.ISSHARED));
            boolean isDeleted = Boolean.parseBoolean(request.getParam(Field.ISDELETED));
            String sortBy = request.getParam(Field.SORTBY);
            Integer page = request.getParam(Field.PAGE) != null ? Integer.parseInt(request.getParam(Field.PAGE)) : null;
            boardService.getAllBoards(user, page, searchText, folderId, isPublic, isShared, isDeleted, sortBy)
                    .onSuccess(result -> renderJson(request, result))
                    .onFailure(fail -> {
                        String message = String.format("[Magneto@%s::getAllBoards] Failed to get all boards : %s",
                                this.getClass().getSimpleName(), fail.getMessage());
                        log.error(message);
                        renderError(request);
                    });
        });
    }

    @Post("/board")
    @ApiDoc("Create a board")
    @SecuredAction(Rights.MANAGE_BOARD)
    public void create(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "board", board ->
                UserUtils.getUserInfos(eb, request, user ->
                    boardService.create(user, board)
                        .onFailure(err -> renderError(request))
                            .onSuccess(result -> renderJson(request, result))));
    }

    @Put("/board/:id")
    @ApiDoc("Update a board")
    @ResourceFilter(ManageBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void update(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "board", board -> {
            String boardId = request.getParam(Field.ID);
            BoardPayload updateBoard = new BoardPayload(board).setId(boardId);
            UserUtils.getUserInfos(eb, request, user ->
                    boardService.update(user, updateBoard)
                            .onFailure(err -> renderError(request))
                            .onSuccess(result -> renderJson(request, result)));
        });
    }



    @Put("/boards/predelete")
    @ApiDoc("Pre delete boards")
    @ResourceFilter(ManageBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @SuppressWarnings("unchecked")
    public void preDeleteBoards(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "deleteBoard", boards ->
                UserUtils.getUserInfos(eb, request, user -> {
                            List<String> boardIds = boards.getJsonArray(Field.BOARDIDS).getList();
                            boardService.preDeleteBoards(user.getUserId(), boardIds, false)
                                    .onFailure(err -> renderError(request))
                                    .onSuccess(result -> renderJson(request, result));
                        }
                ));
    }

    @Put("/boards/restore")
    @ApiDoc("Restore pre deleted boards")
    @ResourceFilter(ManageBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @SuppressWarnings("unchecked")
    public void restorePreDeletedBoards(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "deleteBoard", boards ->
                UserUtils.getUserInfos(eb, request, user -> {
                            List<String> boardIds = boards.getJsonArray(Field.BOARDIDS).getList();
                            boardService.preDeleteBoards(user.getUserId(), boardIds, true)
                                    .onFailure(err -> renderError(request))
                                    .onSuccess(result -> renderJson(request, result));
                        }
                ));
    }

    @Delete("/boards")
    @ApiDoc("Delete boards")
    @ResourceFilter(ManageBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @SuppressWarnings("unchecked")
    public void deleteBoards(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "deleteBoard", boards ->
                UserUtils.getUserInfos(eb, request, user -> {
                            List<String> boardIds = boards.getJsonArray(Field.BOARDIDS).getList();
                            boardService.deleteBoards(user.getUserId(), boardIds)
                                    .onFailure(err -> renderError(request))
                                    .onSuccess(result -> renderJson(request, result));
                        }
                ));
    }

}
