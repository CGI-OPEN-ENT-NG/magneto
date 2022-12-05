export const rights = {
    resources: {
        read: {
            right: "fr-cgi-magneto-controller-ShareBoardController|initReadRight"
        },
        publish: {
            right: "fr-cgi-magneto-controller-ShareBoardController|initPublishRight"
        },
        contrib: {
            right: "fr-cgi-magneto-controller-ShareBoardController|initContribRight"
        },
        manager: {
            right: "fr-cgi-magneto-controller-ShareBoardController|initManagerRight"
        }
    },
    workflow: {
        view: 'fr.cgi.magneto.controller.MagnetoController|view',
        manage: 'fr.cgi.magneto.controller.BoardController|create',
        publish: 'fr.cgi.magneto.controller.FakeRight|boardPublish'
    }
};
