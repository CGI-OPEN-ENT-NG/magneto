package fr.cgi.magneto.service;

import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.boards.BoardPayload;
import fr.cgi.magneto.model.cards.Card;
import fr.cgi.magneto.model.cards.CardPayload;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

import java.util.List;


public interface CardService {

    /**
     * Create a Card
     *
     * @param card Card to create {@link CardPayload}
     * @param id Generated identifier for new card
     * @return Future {@link Future <JsonObject>} containing newly created card
     */
    Future<JsonObject> create(CardPayload card, String id);

    /**
     * Update a card
     *
     * @param user User Object containing user id and displayed name
     * @param card Card to update
     * @return Future {@link Future <JsonObject>} containing updated card
     */
    Future<JsonObject> update(UserInfos user, CardPayload card);

    /**
     * Delete cards
     *
     * @param userId  User identifier
     * @param cardIds List of card identifiers
     * @return Future {@link Future <JsonObject>} containing list of deleted cards
     */
    Future<JsonObject> deleteCards(String userId, List<String> cardIds);

    /**
     * Get last card
     *
     * @param card Card information
     * @return Future {@link Future <JsonObject>} containing last card created by the user
     */
    Future<JsonObject> getLastCard(CardPayload card);

    /**
     * Get all cards
     *
     * @param user       User Object containing user id and displayed name
     * @param boardId
     * @param page       Page number
     * @param isPublic   fetch public boards if true
     * @param isShared   fetch shared boards if true
     * @param searchText Search text
     * @param sortBy     Sort by parameter
     * @return Future {@link Future <JsonObject>} containing all cards created by the user
     */

    Future<JsonObject> getAllCards(UserInfos user, String boardId, Integer page, boolean isPublic, boolean isShared, String searchText, String sortBy);

    /**
     * Get cards by ids
     *
     * @param cardIds Identifier list of the searching card
     * @return Future {@link Future <JsonArray>} containing the card list corresponding to the ids
     */
    Future<List<Card>> getCards(List<String> cardIds);


    /**
     * Get all cards
     *
     * @param boardIds List of board identifiers
     * @return Future {@link Future <JsonObject>} containing list of deleted cards
     */
    Future<JsonObject> deleteCardsByBoards(List<String> boardIds);

    /**
     * Get all cards
     *
     * @param user      User Object containing user id and displayed name
     * @param board     Board object
     * @param page      Page number
     * @param isSection fetch sections if true
     * @return Future {@link Future <JsonObject>} containing the cards corresponding to the board identifier
     */
    Future<JsonObject> getAllCardsByBoard(UserInfos user, Board board, Integer page, boolean isSection);

    /**
     * Duplicate cards
     *
     * @param boardId Board identifiers
     * @param cards   List of card
     * @param user    {@link UserInfos} User info
     * @return Future {@link Future <JsonObject>} containing status of duplicate
     */
    Future<JsonObject> duplicateCards(String boardId, List<Card> cards, UserInfos user);

    /**
     * Update board
     *
     * @param boardPayload Boards to update
     * @return Future {@link Future <JsonObject>} containing status of update
     */
    Future<JsonObject> updateBoard(BoardPayload boardPayload);
}
