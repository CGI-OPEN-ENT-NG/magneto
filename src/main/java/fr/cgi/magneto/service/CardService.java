package fr.cgi.magneto.service;

import fr.cgi.magneto.model.boards.Board;
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
     * @return Future {@link Future <JsonObject>} containing newly created card
     */
    Future<JsonObject> create(CardPayload card);

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
     * @param user User Object containing user id and displayed name
     * @param card Card information
     * @return Future {@link Future <JsonObject>} containing last card created by the user
     */
    Future<JsonObject> getLastCard(CardPayload card);

    /**
     * Get all cards
     *
     * @param user       User Object containing user id and displayed name
     * @param page       Page number
     * @param isPublic   fetch public boards if true
     * @param isShared   fetch shared boards if true
     * @param searchText Search text
     * @param sortBy     Sort by parameter
     * @return Future {@link Future <JsonObject>} containing all cards created by the user
     */

    Future<JsonObject> getAllCards(UserInfos user, Integer page, boolean isPublic, boolean isShared, String searchText, String sortBy);

    /**
     * Get all cards
     *
     * @param cardId Identifier of the searching card
     * @return Future {@link Future <JsonObject>} containing the card corresponding to the id
     */
    Future<JsonObject> getCard(String cardId);

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

}
