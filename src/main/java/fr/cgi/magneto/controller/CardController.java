package fr.cgi.magneto.controller;

import fr.cgi.magneto.Magneto;
import fr.cgi.magneto.core.constants.Actions;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.helper.DateHelper;
import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.boards.BoardPayload;
import fr.cgi.magneto.model.cards.Card;
import fr.cgi.magneto.model.cards.CardPayload;
import fr.cgi.magneto.security.DuplicateRight;
import fr.cgi.magneto.security.ViewRight;
import fr.cgi.magneto.security.WriteBoardRight;
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
import org.entcore.common.events.EventStore;
import org.entcore.common.events.EventStoreFactory;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.filter.Trace;
import org.entcore.common.user.UserUtils;

import java.util.*;
import java.util.stream.Collectors;

import static fr.cgi.magneto.core.enums.Events.CREATE_MAGNET;

public class CardController extends ControllerHelper {

    private final EventStore eventStore;
    private final CardService cardService;
    private final BoardService boardService;

    public CardController(ServiceFactory serviceFactory) {
        this.cardService = serviceFactory.cardService();
        this.boardService = serviceFactory.boardService();
        this.eventStore = EventStoreFactory.getFactory().getEventStore(Magneto.class.getSimpleName());
    }

    @Get("/cards/collection")
    @ApiDoc("Get all cards collection")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void getAllCardsCollection(HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            String searchText = (request.getParam(Field.SEARCHTEXT) != null) ?
                    request.getParam(Field.SEARCHTEXT) : "";
            String sortBy = request.getParam(Field.SORTBY);
            String boardId = request.getParam(Field.BOARDID);
            boolean isPublic = Boolean.parseBoolean(request.getParam(Field.ISPUBLIC));
            boolean isShared = Boolean.parseBoolean(request.getParam(Field.ISSHARED));
            Integer page = request.getParam(Field.PAGE) != null ? Integer.parseInt(request.getParam(Field.PAGE)) : null;
            cardService.getAllCards(user, boardId, page, isPublic, isShared, searchText, sortBy)
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
    @ApiDoc("Get all cards by board id")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void getAllCardsByBoardId(HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            String boardId = request.getParam(Field.BOARDID);
            Integer page = request.getParam(Field.PAGE) != null ? Integer.parseInt(request.getParam(Field.PAGE)) : null;
            boardService.getBoards(Collections.singletonList(boardId))
                    .compose(board -> cardService.getAllCardsByBoard(user, board.get(0), page, false))
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
        cardService.getCards(Collections.singletonList(cardId))
                .onSuccess(result -> {
                    renderJson(request, !result.isEmpty() ? result.get(0).toJson() : new JsonObject());
                })
                .onFailure(fail -> {
                    String message = String.format("[Magneto@%s::getCard] Failed to get card by id : %s",
                            this.getClass().getSimpleName(), fail.getMessage());
                    log.error(message);
                    renderError(request);
                });
    }

    @Post("/card")
    @ApiDoc("Create a card")
    @ResourceFilter(WriteBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @Trace(Actions.CARD_CREATION)
    public void createCard(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "card", body ->
                UserUtils.getUserInfos(eb, request, user -> {
                    CardPayload cardPayload = new CardPayload(body)
                            .setOwnerId(user.getUserId())
                            .setOwnerName(user.getUsername());
                    String newId = UUID.randomUUID().toString();
                    Future<JsonObject> createCardFuture = cardService.create(cardPayload, newId);
                    Future<List<Board>> getBoardFuture = boardService.getBoards(Collections.singletonList(cardPayload.getBoardId()));
                    CompositeFuture.all(createCardFuture, getBoardFuture)
                            .compose(result -> cardService.getLastCard(cardPayload))
                            .compose(result -> {
                                if (!getBoardFuture.result().isEmpty()) {
                                    BoardPayload boardPayload = new BoardPayload(getBoardFuture.result().get(0).toJson());
                                    boardPayload.addCards(Collections.singletonList(result.getString(Field._ID)));
                                    return cardService.updateBoard(boardPayload);
                                } else {
                                    return Future.failedFuture(String.format("[Magneto%s::createCard] " +
                                            "No card found with id %s", this.getClass().getSimpleName(), newId));
                                }
                            })
                            .onFailure(err -> renderError(request))
                            .onSuccess(res -> {
                                eventStore.createAndStoreEvent(CREATE_MAGNET.name(), request);
                                renderJson(request, res);
                            });
                }));
    }

    @Put("/card")
    @ApiDoc("Update a card")
    @ResourceFilter(WriteBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @Trace(Actions.CARD_UPDATE)
    public void update(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "cardUpdate", card -> {
            CardPayload updateCard = new CardPayload(card)
                    .setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
            UserUtils.getUserInfos(eb, request, user -> {
                Future<JsonObject> updateCardFuture = cardService.update(user, updateCard);
                Future<List<Board>> getBoardFuture = boardService.getBoards(Collections.singletonList(updateCard.getBoardId()));
                CompositeFuture.all(updateCardFuture, getBoardFuture)
                        .compose(result -> {
                            Board currentBoard = getBoardFuture.result().get(0);
                            BoardPayload boardToUpdate = new BoardPayload()
                                    .setId(currentBoard.getId())
                                    .setPublic(currentBoard.isPublic())
                                    .setCardIds(currentBoard.cards()
                                            .stream()
                                            .map(Card::getId)
                                            .collect(Collectors.toList()))
                                    .setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
                            return boardService.update(boardToUpdate);
                        })
                        .onFailure(err -> renderError(request))
                        .onSuccess(res -> renderJson(request, res));
            });
        });
    }

    @SuppressWarnings("unchecked")
    @Post("/card/duplicate")
    @ApiDoc("Duplicate a card")
    @ResourceFilter(DuplicateRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @Trace(Actions.CARD_CREATION)
    public void duplicate(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "cardDuplicate", duplicateCard -> {
            UserUtils.getUserInfos(eb, request, user -> {
                List<String> cardIds = duplicateCard.getJsonArray(Field.CARDIDS, new JsonArray()).getList();
                String boardId = duplicateCard.getString(Field.BOARDID);
                cardService.getCards(cardIds)
                        .compose(cards -> cardService.duplicateCards(boardId, cards, user))
                        .onSuccess(res -> {
                            eventStore.createAndStoreEvent(CREATE_MAGNET.name(), request);
                            renderJson(request, res);
                        })
                        .onFailure(err -> renderError(request));
            });
        });
    }
    @Post("/card/move")
    @ApiDoc("Move a card to another board")
    @ResourceFilter(WriteBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void moveCard(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "moveCard", moveCard -> {
            UserUtils.getUserInfos(eb, request, user -> {
                CardPayload updateCard = new CardPayload(moveCard.getJsonObject(Field.CARD));
                String oldBoardId = updateCard.getBoardId();
                updateCard.setBoardId(moveCard.getString(Field.BOARDID));

                Future<JsonObject> updateCardFuture = cardService.update(user, updateCard);
                Future<List<Board>> getBoardFuture = boardService.getBoards(Collections.singletonList(moveCard.getString(Field.BOARDID)));
                CompositeFuture.all(updateCardFuture, getBoardFuture)
                        .compose(result -> {
                            Board currentBoard = getBoardFuture.result().get(0);
                            BoardPayload boardToUpdate = new BoardPayload()
                                    .setId(currentBoard.getId())
                                    .setPublic(currentBoard.isPublic())
                                    .setCardIds(currentBoard.cards()
                                            .stream()
                                            .map(Card::getId)
                                            .collect(Collectors.toList()))
                                    .addCards(Collections.singletonList(updateCard.getId()))
                                    .setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
                            return boardService.update(boardToUpdate);
                        })
                        .compose(result -> boardService.getBoards(Collections.singletonList(oldBoardId)))
                        .compose(board -> {
                            if (!board.isEmpty()) {
                                BoardPayload updateBoard = new BoardPayload(board.get(0).toJson());
                                updateBoard.removeCardIds(Collections.singletonList(moveCard.getJsonObject(Field.CARD).getString(Field.ID)));
                                return boardService.update(updateBoard);
                            } else {
                                return Future.failedFuture(String.format("[Magneto%s::moveCard] " +
                                        "No board found with id %s", this.getClass().getSimpleName(), oldBoardId));
                            }

                        })
                        .onFailure(err -> renderError(request))
                        .onSuccess(res -> renderJson(request, res));
            });
        });
    }


    @Delete("/cards/:boardId")
    @ApiDoc("Delete cards")
    @ResourceFilter(WriteBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @Trace(Actions.CARD_DELETION)
    @SuppressWarnings("unchecked")
    public void deleteCards(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "cardList", cards ->
                UserUtils.getUserInfos(eb, request, user -> {
                            List<String> cardIds = cards.getJsonArray(Field.CARDIDS, new JsonArray()).getList();
                            String boardId = request.getParam(Field.BOARDID);
                            Future<JsonObject> deleteCardsFuture = cardService.deleteCards(user.getUserId(), cardIds);
                            Future<List<Board>> getBoardFuture = boardService.getBoards(Collections.singletonList(boardId));
                            CompositeFuture.all(deleteCardsFuture, getBoardFuture)
                                    .compose(result -> {
                                        if (!getBoardFuture.result().isEmpty()) {
                                            Board currentBoard = getBoardFuture.result().get(0);
                                            BoardPayload boardToUpdate = new BoardPayload()
                                                    .setId(currentBoard.getId())
                                                    .setPublic(currentBoard.isPublic())
                                                    .setCardIds(currentBoard.cards()
                                                            .stream()
                                                            .map(Card::getId)
                                                            .collect(Collectors.toList()))
                                                    .removeCardIds(cardIds)
                                                    .setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
                                            return boardService.update(boardToUpdate);
                                        } else {
                                            return Future.failedFuture(String.format("[Magneto%s::deleteCards] " +
                                                    "No board found with id %s", this.getClass().getSimpleName(), boardId));
                                        }
                                    })
                                    .onFailure(err -> renderError(request))
                                    .onSuccess(res -> renderJson(request, res));
                        }
                ));
    }

}
