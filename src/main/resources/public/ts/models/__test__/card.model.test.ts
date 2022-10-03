import {Card, CardForm} from "../card.model";

describe("CardModel", () => {
    it('test card initialization', done => {
        const cardResponse = {
            id: 'id',
            title: 'title',
            description: 'description',
            caption: 'caption',
            resourceId: 'resourceId',
            resourceUrl: 'resourceUrl',
            resourceType: 'resourceType',
            boardId: 'boardId',
            ownerId: 'ownerId',
            ownerName: 'ownerName',
            creationDate: 'creationDate',
            modificationDate: 'modificationDate',
            lastModifierId: 'lastModifierId',
            lastModifierName: 'lastModifierName',
            parentId: 'parentId',
            metadata: {
                name: 'name',
                filename: 'fileName',
                contentType: 'contentType',
                contentTransferEncoding: 'contentTransferEncoding',
                charset: 'charset',
                size: 1
            }
        };

        const card = new Card().build(cardResponse);

        expect(card.id).toEqual(cardResponse.id);
        expect(card.title).toEqual(cardResponse.title);
        expect(card.description).toEqual(cardResponse.description);
        expect(card.caption).toEqual(cardResponse.caption);
        expect(card.resourceId).toEqual(cardResponse.resourceId);
        expect(card.resourceUrl).toEqual(cardResponse.resourceUrl);
        expect(card.resourceType).toEqual(cardResponse.resourceType);
        expect(card.boardId).toEqual(cardResponse.boardId);
        expect(card.ownerId).toEqual(cardResponse.ownerId);
        expect(card.ownerName).toEqual(cardResponse.ownerName);
        expect(card.creationDate).toEqual(cardResponse.creationDate);
        expect(card.modificationDate).toEqual(cardResponse.modificationDate);
        expect(card.lastModifierId).toEqual(cardResponse.lastModifierId);
        expect(card.lastModifierName).toEqual(cardResponse.lastModifierName);
        expect(card.parentId).toEqual(cardResponse.parentId);
        expect(card.metadata.name).toEqual(cardResponse.metadata.name);
        expect(card.metadata.filename).toEqual(cardResponse.metadata.filename);
        expect(card.metadata.contentType).toEqual(cardResponse.metadata.contentType);
        expect(card.metadata.contentTransferEncoding).toEqual(cardResponse.metadata.contentTransferEncoding);
        expect(card.metadata.charset).toEqual(cardResponse.metadata.charset);
        expect(card.metadata.size).toEqual(cardResponse.metadata.size);
        done();
    });

    it('test CardForm initialization', done => {
        const cardForm = new CardForm();
        cardForm.id = '';
        cardForm.title = '';
        cardForm.description = '';
        cardForm.caption = '';
        cardForm.resourceId = '';
        cardForm.resourceType = '';
        cardForm.resourceFileName = '';
        cardForm.resourceUrl = '';
        cardForm.boardId = '';
        cardForm.sectionId = 0;
        done();
    });

    it('test CardForm resourceUrl', done => {
        const cardForm = new CardForm();
        cardForm.resourceType = 'image';
        cardForm.resourceId = 'resourceId';
        expect(cardForm.resourceUrl).toEqual('/workspace/document/resourceId');
        done();
    })
});