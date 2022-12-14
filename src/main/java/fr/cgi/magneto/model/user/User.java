package fr.cgi.magneto.model.user;

import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.model.Model;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

public class User extends UserInfos implements Model<User> {

    public User(String id, String name) {
        super();
        this.setUserId(id);
        this.setUsername(name);
    }

    public User(JsonObject user) {
        super();
        this.setUserId(user.getString(Field.ID));
        this.setUsername(user.getString(Field.USERNAME));
    }


    @Override
    public JsonObject toJson() {
        return new JsonObject()
                .put(Field.ID, this.getUserId())
                .put(Field.USERNAME, this.getUsername());
    }

    @Override
    public User model(JsonObject model) {
        return null;
    }
}
