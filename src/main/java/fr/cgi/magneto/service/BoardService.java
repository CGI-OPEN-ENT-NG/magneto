package fr.cgi.magneto.service;

import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.boards.BoardPayload;
import io.vertx.core.*;
import io.vertx.core.json.*;
import org.entcore.common.user.UserInfos;

import java.util.*;


public interface BoardService {

    /**
     * Create a Board
     *
     * @param user  User Object containing user id and displayed name
     * @param board JsonObjet Board to create
     * @return Future {@link Future <JsonObject>} containing newly created board
     */
    Future<JsonObject> create(UserInfos user, JsonObject board);

    /**
     * Update a board
     *
     * @param board Board to update
     * @return Future {@link Future <JsonObject>} containing updated board
     */
    Future<JsonObject> update(BoardPayload board);

    /**
     * Get boards by id
     *
     * @param boardIds Board ids to get data
     * @return Future {@link Future <JsonObject>} containing a list of board
     */
    Future<List<Board>> getBoards(List<String> boardIds);


    /**
     * Get all boards
     *
     * @param user       User Object containing user id and displayed name
     * @param page       Page number
     * @param searchText Search text
     * @param folderId   Folder identifier
     * @param isPublic   fetch public boards if true
     * @param isShared   fetch shared boards if true
     * @param isDeleted  fetch deleted boards if true
     * @param sortBy     Sort by parameter
     * @return Future {@link Future <JsonObject>} containing list of boards
     */
    Future<JsonObject> getAllBoards(UserInfos user, Integer page, String searchText, String folderId,
                                    boolean isPublic, boolean isShared, boolean isDeleted, String sortBy);
    /**
     * Get all boards with publish right
     *
     * @param user    {@link UserInfos} User info
     * @return Future {@link Future <List<Board>} containing list of editable boards
     */
    Future<List<Board>> getAllBoardsEditable(UserInfos user);

    /**
     * Pre delete boards
     *
     * @param userId   User identifier
     * @param boardIds List of board identifiers
     * @param restore  If true : restore from trash
     * @return Future {@link Future <JsonObject>} containing list of predeleted boards
     */
    Future<JsonObject> preDeleteBoards(String userId, List<String> boardIds, boolean restore);

    /**
     * Delete boards
     *
     * @param userId   User identifier
     * @param boardIds List of board identifiers
     * @return Future {@link Future <JsonObject>} containing list of deleted boards
     */
    Future<JsonObject> delete(String userId, List<String> boardIds);

}
