package fr.cgi.magneto.controller;

import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Rights;
import fr.cgi.magneto.helper.DateHelper;
import fr.cgi.magneto.model.boards.BoardPayload;
import fr.cgi.magneto.model.cards.CardPayload;
import fr.cgi.magneto.security.ManageBoardRight;
import fr.cgi.magneto.security.ViewRight;
import fr.cgi.magneto.service.BoardService;
import fr.cgi.magneto.service.CardService;
import fr.cgi.magneto.service.ServiceFactory;
import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.user.UserUtils;

import java.util.Collections;
import java.util.Date;
import java.util.List;

public class CardController extends ControllerHelper {

    private final CardService cardService;
    private final BoardService boardService;

    public CardController(ServiceFactory serviceFactory) {
        this.cardService = serviceFactory.cardService();
        this.boardService = serviceFactory.boardService();
    }

    @Get("/cards")
    @ApiDoc("Get all cards")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void getAllCards(HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            String searchText = (request.getParam(Field.SEARCHTEXT) != null) ?
                    request.getParam(Field.SEARCHTEXT) : "";
            String sortBy = request.getParam(Field.SORTBY);
            boolean isPublic = Boolean.parseBoolean(request.getParam(Field.ISPUBLIC));
            boolean isShared = Boolean.parseBoolean(request.getParam(Field.ISSHARED));
            Integer page = request.getParam(Field.PAGE) != null ? Integer.parseInt(request.getParam(Field.PAGE)) : null;
            cardService.getAllCards(user, page, isPublic, isShared, searchText, sortBy)
                    .onSuccess(result -> renderJson(request, result))
                    .onFailure(fail -> {
                        String message = String.format("[Magneto@%s::getAllCards] Failed to get all cards : %s",
                                this.getClass().getSimpleName(), fail.getMessage());
                        log.error(message);
                        renderError(request);
                    });
        });
    }

    @Get("/cards/:boardId")
    @ApiDoc("Get all cards")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void getAllCardsByBoardId(HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            String boardId = request.getParam(Field.BOARDID);
            Integer page = request.getParam(Field.PAGE) != null ? Integer.parseInt(request.getParam(Field.PAGE)) : null;
            cardService.getAllCardsByBoard(user, boardId, page, false)
                    .onSuccess(result -> renderJson(request, result))
                    .onFailure(fail -> {
                        String message = String.format("[Magneto@%s::getAllCardsByBoardId] Failed to get all cards : %s",
                                this.getClass().getSimpleName(), fail.getMessage());
                        log.error(message);
                        renderError(request);
                    });
        });
    }

    @Get("/card/:id")
    @ApiDoc("Get card by id")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void getCard(HttpServerRequest request) {
        String cardId = request.getParam(Field.ID);
        cardService.getCard(cardId)
                .onSuccess(result -> renderJson(request, result))
                .onFailure(fail -> {
                    String message = String.format("[Magneto@%s::getCard] Failed to get card by id : %s",
                            this.getClass().getSimpleName(), fail.getMessage());
                    log.error(message);
                    renderError(request);
                });
    }

    @Post("/card")
    @ApiDoc("Create a card")
    @SecuredAction(Rights.MANAGE_BOARD)
    public void create(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "card", body ->
                UserUtils.getUserInfos(eb, request, user -> {
                    CardPayload card = new CardPayload(body);
                    Future<JsonObject> createCardFuture = cardService.create(user, card);
                    Future<JsonArray> getBoardFuture = boardService.getBoards(Collections.singletonList(card.getBoardId()));
                    CompositeFuture.all(createCardFuture, getBoardFuture)
                            .compose(result -> cardService.getLastCard(user, card))
                            .compose(result -> {
                                if (getBoardFuture.result().isEmpty()) {
                                    String message = String.format("[Magneto@%s::create] Failed to create card: No board found with id %s",
                                            this.getClass().getSimpleName(), card.getBoardId());
                                    return Future.failedFuture(message);
                                }
                                BoardPayload updateBoard = new BoardPayload(getBoardFuture.result().getJsonObject(0));
                                updateBoard.setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
                                updateBoard.addCardId(result.getString(Field._ID));
                                return boardService.update(user, updateBoard);
                            })
                            .onFailure(err -> renderError(request))
                            .onSuccess(res -> renderJson(request, res));
                }));
    }

    @Put("/card/:id")
    @ApiDoc("Update a card")
    @ResourceFilter(ManageBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void update(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "card", card -> {
            String cardId = request.getParam(Field.ID);
            CardPayload updateCard = new CardPayload(card)
                    .setId(cardId)
                    .setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
            UserUtils.getUserInfos(eb, request, user -> {
                Future<JsonObject> updateCardFuture = cardService.update(user, updateCard);
                Future<JsonArray> getBoardFuture = boardService.getBoards(Collections.singletonList(updateCard.getBoardId()));
                CompositeFuture.all(updateCardFuture, getBoardFuture)
                        .compose(result -> {
                            BoardPayload updateBoard = new BoardPayload(getBoardFuture.result().getJsonObject(0));
                            updateBoard.setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
                            return boardService.update(user, updateBoard);
                        })
                        .onFailure(err -> renderError(request))
                        .onSuccess(res -> renderJson(request, res));
            });
        });
    }

    @Delete("/cards/:boardId")
    @ApiDoc("Delete cards")
    @ResourceFilter(ManageBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @SuppressWarnings("unchecked")
    public void deleteCards(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "cardList", cards ->
                UserUtils.getUserInfos(eb, request, user -> {
                            List<String> cardIds = cards.getJsonArray(Field.CARDIDS, new JsonArray()).getList();
                            String boardId = request.getParam(Field.BOARDID);
                            Future<JsonObject> deleteCardsFuture = cardService.deleteCards(user.getUserId(), cardIds);
                            Future<JsonArray> getBoardFuture = boardService.getBoards(Collections.singletonList(boardId));
                            CompositeFuture.all(deleteCardsFuture, getBoardFuture)
                                    .compose(result -> {
                                        BoardPayload updateBoard = new BoardPayload(getBoardFuture.result().getJsonObject(0));
                                        updateBoard.setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
                                        updateBoard.removeCardIds(cardIds);
                                        return boardService.update(user, updateBoard);
                                    })
                                    .onFailure(err -> renderError(request))
                                    .onSuccess(res -> renderJson(request, res));
                        }
                ));
    }

}
