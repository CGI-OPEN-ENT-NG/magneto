package fr.cgi.magneto.service;

import io.vertx.core.*;
import io.vertx.core.json.*;
import org.entcore.common.user.UserInfos;


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
     * Get all boards
     * @param user          User Object containing user id and displayed name
     * @param page          Page number
     * @param searchText    Search text
     * @param folderId      Folder identifier
     * @param isPublic      fetch public boards if true
     * @param isShared      fetch shared boards if true
     * @param sortBy        Sort by parameter
     * @return              Future {@link Future <JsonObject>} containing list of boards
     */
    Future<JsonObject> getAllBoards(UserInfos user, Integer page, String searchText, String folderId, boolean isPublic, boolean isShared, String sortBy);

}
